# @getkirby/api-js

**DO NOT USE YET!**

## Install

```
$ npm install @getkirby/api-js
```

## Usage

```php
<script>
  your_csrf_variable = <?= csrf() ?>; 
</script>
```

```js
import Api from "@getkirby/api-js";

Api.config.endpoint = "https://yoursite.com/api;
Api.config.csrf = window.your_csrf_variable;

Api.pages.get("blog").then(page => {
  // ...
})
```
