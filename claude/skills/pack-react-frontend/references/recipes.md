# React frontend: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).
The names are illustrations; the project's golden paths name the real
files to copy from.

## Split a long section

State and derivation stay at the top; each visual block becomes its own
component.

```tsx
export function PriceEstimator({ language }: { language: Language }) {
  const [plan, setPlan] = useState<Plan>(rates.defaultPlan)
  const [hours, setHours] = useState(rates.hoursPerDay.initial)
  const [days, setDays] = useState(rates.daysPerMonth.initial)
  const estimate = monthlyEstimate(plan, hours, days)
  return (
    <EstimatorSection language={language}>
      <Controls language={language} plan={plan} hours={hours} days={days}
        onPlan={setPlan} onHours={setHours} onDays={setDays} />
      <Result language={language} estimate={estimate} />
      <Tiers language={language} plan={plan} current={estimate.tier} />
    </EstimatorSection>
  )
}
```

## Double-submit guard and focus after the outcome

```tsx
const inFlight = useRef(false)
const submit = (event: SubmitEvent<HTMLFormElement>) => {
  event.preventDefault()
  if (inFlight.current) return
  inFlight.current = true
  const release = () => { inFlight.current = false }
  void handleSubmit((fields) => { sending.mutate(fields, { onSettled: release }) }, release)(event)
}
useEffect(() => {
  if (phase === 'received') received.current?.focus()
  else if (phase === 'unavailable' && document.activeElement === document.body) submitButton.current?.focus()
}, [phase])
```

## Double submit, proven

```ts
await submit.evaluate((b: HTMLButtonElement) => { b.click(); b.click() })
```

Then wait for the outcome and assert that `page.on('request')` recorded
exactly one POST. `dblclick()` is not proof: CDP round trips let React
commit `disabled` between the clicks.

## URL as state (TanStack Router)

```ts
const search = z.object({ tab: z.literal('archived').optional().catch(undefined) })
export const Route = createFileRoute('/_authenticated/members')({ validateSearch: search, component: MembersRoute })
void navigate({ search: (current) => ({ ...current, tab: 'archived' }), replace: true })
```

## Theme before first paint, from one source

Serialize the function into `<head>`, set
`<html suppressHydrationWarning>`, and have the toggle import the same
storage key.

```ts
export const themeScript = inlineScript(applyStoredTheme, themeStorageKey, themes, defaultTheme)
```

`applyStoredTheme` reads storage inside `try/catch` and falls back to
the default theme.

## Plurals

```ts
const rules = new Intl.PluralRules(languageTag)
export const items = (n: number) => ({ one: `${n} item`, other: `${n} items` })[rules.select(n) === 'one' ? 'one' : 'other']
```

Check the categories per language by hand: pt-BR selects `one` for 0
and 1.5; en selects `other` for both.

## Journey shape

The id and a sentence in the title, the loop outside the test, copy
taken from strings, a literal expected value.

```ts
for (const language of languages) {
  const text = strings[language].pricing.estimator
  test(`est-basic-32-5 — ${language}: 2.5 h × 13 days on the basic plan costs $487.50`, async ({ page, expectAccessible }) => {
    await page.goto(paths.pricing(language))
    const estimator = page.getByRole('region', { name: text.title })
    await estimator.getByLabel(text.plan).selectOption({ label: text.plans.basic })
    await estimator.getByLabel(text.hoursPerDay).fill('2.5')
    await estimator.getByLabel(text.daysPerMonth).fill('13')
    await expect(estimator.getByText('$487.50', { exact: true })).toBeVisible()
    await expectAccessible()
  })
}
```

`expectAccessible` is a fixture that runs axe on the current page.

## Values

| What | Value | Source |
|---|---|---|
| Touch targets | 44px phone, ≥ 24px desktop | WCAG 2.5.8 |
| Widths to check | 390 and 1440, plus 320 for reflow | WCAG 1.4.10 |
| Route pending | `pendingMs: 150`, `pendingMinMs: 200` | (inference) |
| Spinner | show after 150–300ms, keep 300–500ms | Vercel |
| Writes | complete in under 500ms | Vercel |
| Playwright `expect` timeout | 5s | Playwright |
| `expect.poll` intervals | `[100, 250, 500, 1000]`ms | Playwright |
| `toPass` timeout | defaults to 0, so always set it | Playwright |
