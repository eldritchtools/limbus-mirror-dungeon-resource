import os
import json

gifts = {}

keyword_map = {
    "None": "Keywordless",
    "Combustion": "Burn",
    "Laceration": "Bleed",
    "Vibration": "Tremor",
    "Burst": "Rupture",
    "Sinking": "Sinking",
    "Breath": "Poise",
    "Charge": "Charge",
    "Slash": "Slash",
    "Penetrate": "Pierce",
    "Hit": "Blunt"
}

vestiges = ["Dark Vestige", "Faint Vestige", "Twinkling Vestige", "Brilliant Vestige", "Lunar Vestige"]

gift_image_overrides = {}
with open("gift_image_overrides.json", 'r') as file:
    gift_image_overrides = json.load(file)

for entry in os.listdir("./game_data"):
    path = os.path.join("./game_data", entry)
    with open(path, 'r', encoding="utf8") as file:
        data = json.load(file)
        # data file
        if "list" in data:
            for item in data["list"]:
                id = item["id"]
                if id not in gifts:
                    gifts[id] = {}

                tier = None
                for tag in item["tag"]:
                    if "TIER_" in tag:
                        gifts[id]["tier"] = tag.split("_")[1]

                gifts[id]["keyword"] = keyword_map[item.get("keyword", "None")]

                if "upgradeDataList" in item and len(item["upgradeDataList"]) > 1:
                    gifts[id]["enhanceable"] = True

        # text file
        elif "dataList" in data:
            for item in data["dataList"]:
                id = item["id"]
                if id not in gifts:
                    gifts[id] = {}

                gifts[id]["name"] = item["name"].replace("\u2018", "'").replace("\u2019", "'")
                if gifts[id]["name"] in gift_image_overrides:
                    gifts[id]["image_override"] = gift_image_overrides[gifts[id]["name"]]

                if gifts[id]["name"] in vestiges:
                    gifts[id]["vestige"] = True

gifts = {key: value for key, value in gifts.items() if "name" in value and "tier" in value and "+" not in value["name"]}

gifts_name_mapping = {}
for (id, gift) in gifts.items():
    gifts_name_mapping[gift["name"]] = id

def convert_ingredient(ingredient):
    if isinstance(ingredient, str):
        return gifts_name_mapping[ingredient]
    elif isinstance(ingredient, dict):
        return {
            "count": ingredient["count"],
            "options": [gifts_name_mapping[name] for name in ingredient["options"]]
        }

fusion_ingredients = {}

def add_ingredient(ingredient, result):
    if isinstance(ingredient, int):
        if ingredient not in fusion_ingredients:
            fusion_ingredients[ingredient] = [result]
        else:
            fusion_ingredients[ingredient].append(result)
    elif isinstance(ingredient, dict):
        for item in ingredient["options"]:
            add_ingredient(item, result)

with open("fusion_recipes.json", 'r', encoding="utf8") as file:
    data = json.load(file)
    for fusion in data:
        id = gifts_name_mapping[fusion["name"]]
        if fusion["name"] == "Lunar Memory":
            gifts[id]["fusion"] = False
        else:
            gifts[id]["fusion"] = True

        ingredients = [convert_ingredient(name) for name in fusion["ingredients"]]
        for ingredient in ingredients:
            add_ingredient(ingredient, id)
        if "recipes" not in gifts[id]:
            gifts[id]["recipes"] = []
        gifts[id]["recipes"].append(ingredients)

def propagate(id, function):
    function(id)
    if id in fusion_ingredients:
        for result in fusion_ingredients[id]:
            propagate(result, function)

with open("hard_only_gifts.json", 'r') as file:
    def set_hardonly(x):
        gifts[x]["hardonly"] = True

    data = json.load(file)
    for gift in data["hard"]:
        propagate(gifts_name_mapping[gift], set_hardonly)


theme_packs = {}

with open("theme_packs.json", 'r', encoding="utf8") as file:
    data = json.load(file)
    for (id, info) in data.items():
        theme_packs[id] = {
            "name": info["name"],
            "image": info["image"],
            "category": info["category"],
            "tags": info["tags"]
        }

        def set_sources(x):
            if "sources" not in gifts[x]:
                gifts[x]["sources"] = [id]
            else:
                if id not in gifts[x]["sources"]:
                    gifts[x]["sources"].append(id)
        
        if "unique_gifts" in info:
            theme_packs[id]["unique_gifts"] = [gifts_name_mapping[name] for name in info["unique_gifts"]]
            for gift in info["unique_gifts"]:
                propagate(gifts_name_mapping[gift], set_sources)

floors = {}

with open("floors.json", 'r') as file:
    floors = json.load(file)

for (id, gift) in gifts.items():
    if "sources" not in gift or "hardonly" in gift:
        continue
    
    if any(any(source in packs for packs in floors["normal"].values()) for source in gift["sources"]):
        continue
    
    gift["hardonly"] = True


data = {
    "gifts": gifts,
    "theme_packs": theme_packs,
    "floors": floors
}

with open("data.json", "w") as file:
    json.dump(data, file, indent=4)