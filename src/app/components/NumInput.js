function handleSetNumberInput(val, setValue, force, min, max) {
    const parsed = parseInt(val, 10);
    if (force) {
        if (isNaN(parsed)) setValue(min);
        else {
            let v = parsed;
            if (min) v = Math.max(min, v);
            if (max) v = Math.min(max, v);
            setValue(v);
        }
    } else {
        setValue(parsed);
    }
}

function NumInput({ value, setValue, min, max, disabled = false, width = 5, blurOnEnter = false }) {
    const optProps = {};
    if (blurOnEnter) {
        optProps.onKeyDown = e => {
            if (e.key === "Enter") {
                e.target.blur();
            }
        };
    }

    return <input type="number" min={min} max={max} value={value} disabled={disabled}
        onChange={e => handleSetNumberInput(e.target.value, setValue, false)}
        onBlur={e => handleSetNumberInput(e.target.value, setValue, true, min, max)}
        style={{ width: `${width}ch`, textAlign: "center" }}
        {...optProps}
    />
}

export { handleSetNumberInput, NumInput };