## jq.sortable.js

AppFramework jQMobi scrollable lists plugin



## USAGE

Basic usage:

### INCLUDE

```html
    <!-- JS Section -->
    <script src="jq.mobi.js" type="text/javascript" charset="utf-8"></script>
    <script src="jq.ui.js" type="text/javascript" charset="utf-8"></script>
    <script src="jq.sortable.js" type="text/javascript" charset="utf-8"></script>

    <!-- CSS Section -->
    <link rel="stylesheet" href="jq.sortable.css" type="text/css" media="screen" charset="utf-8">
```

### HTML

```html
<ul class='sortable'>
  <li>Elem1</li>
  <li>Elem2</li>
  <li>Elem3</li>
  <li>Elem4</li>
  <li>Elem5</li>
</ul>
```

### JS

```js
<script type='text/javascript'>
  $(function() {
    $('.sortable').sortable();
  });
</script>
```

### OPTIONS


jq.sortable.js takes the following options:

 *  *overlap*: string | class assigned to overlapped li (default: 'ui-overlap')
 *  *dragged*: string | class assigned to dragged li (default: 'ui-dragged')
 *  *placeholder*: string | class assigned to placeholder li (default: 'ui-placeholder')
 *  *relative_to*: string | selector represinting the parent object (default: 'body')
 *  *before_drag*: function | function called before dragging starts 
                               dragged int index of the dragged element
                             overlap int index of the substituted element, -1 if none
 *  *on_drag*: function | function called during dragging 
                           dragged int index of the dragged element
                           overlap int index of the substituted element, -1 if none
 *  *after_drag*: function | function called after dragging is end paramenters
                              dragged int index of the dragged element
                              overlap int index of the substituted element, -1 if none

