# Using it in CI

`generate` needs no browser, so it fits a release pipeline:

```yaml
- run: |
    bunx changeolog analyze --from ${{ steps.prev.outputs.tag }} --to ${{ github.ref_name }}
    bunx changeolog generate --update
```

This is a sketch: Changeolog is not published to npm yet, so install it from source in your pipeline.
