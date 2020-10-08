# Write a nodejs GraphQL API that would match Star Wars characters using data from SWAPI

## Goal

### User scenario

1. I type a character name.
   (Bonus task: autocomplete API)
2. A list of characters appears with 5 matches ranged by match percentage.
3. For each character in the list I see their name, species, home planet, age, and match percentage (00.0%).

### Matching criteria / their weights

- Species / 30%
- Age / 5% / max difference = 100 years
- Home planet / 5%
- Eye colour / 20%
- Height / 17% / max difference = 100 cm
- Weight / 23% / max difference = 100 kg

## Config

"./config/default.json"

```
{
  "mongoURI": "mongodb://localhost/swapi",
  "port": 3341
}
```

## Run

`npm start`
