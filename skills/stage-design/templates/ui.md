# UI — <wave>

<!--
  How the UI works today and how this feature lands in it. MUST have:
  the current patterns the feature must grow (from the front repo's real
  code — exact tokens and components, lifted from source); every screen
  with the components that carry it and EVERY state the stories imply
  (the bad-paths tables are the checklist — a screen with only its happy
  state is half a screen); and the artboard index into ui/ — every
  screen named here has its <Screen>.dc.html, every artboard has its
  screen here, canvas.json lists them all. The conductor publishes ui/
  as the wave's design canvas; the canvas link lands here after the
  first publish.
-->

## The patterns this feature grows

| Pattern | Where it lives today | How this feature uses it |
|---|---|---|
| <component/token/convention> | <file in the front repo> | <use> |

## Screens

### <screen name> (covers S-00N)

- **Carried by:** <existing components>
- **New here:** <new component + the decision block that justifies it, or "nothing">
- **States:** loading · empty · error · permission-denied · <the story's bad-path outcomes, each with its treatment>
- **Artboard:** `ui/<Screen>.dc.html`

## The canvas

- **Link:** <the wave's design canvas — where the user validates and edits>
- **Artboards:** <the list, as in canvas.json>

## References

- <research file · URL · internal code path — front files read>
