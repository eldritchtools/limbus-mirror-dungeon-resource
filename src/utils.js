function handleSetNumberInput(val, setValue, force, min, max) {
    const parsed = parseInt(val, 10);
    if(force) {
        if(isNaN(parsed)) setValue(min);
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

function NumInputComponent({ value, setValue, min, max, disabled = false, width = 5 }) {
    return <input type="number" min={min} max={max} value={value} disabled={disabled}
        onChange={e => handleSetNumberInput(e.target.value, setValue, false)}
        onBlur={e => handleSetNumberInput(e.target.value, setValue, true, min, max)}
        style={{ width: `${width}ch`, textAlign: "center" }}
    />
}

export { handleSetNumberInput, NumInputComponent };