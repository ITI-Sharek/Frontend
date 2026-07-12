Pill-shaped chip group for single or multi-select (experience level, team size, interests in registration step 3).

```jsx
<ChipSelect label="سنوات الخبرة" options={[{value:"junior",label:"أقل من سنة"}]} value={exp} onChange={setExp} />
<ChipSelect label="مجالات الاهتمام" options={interests} value={selected} onChange={setSelected} multiple />
```

Set `multiple` for checkbox-like chip groups (array value); omit for radio-like single choice (string value).
