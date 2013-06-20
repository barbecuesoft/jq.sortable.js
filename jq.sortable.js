/**
 * jq.web.carousel - a carousel library for html5 mobile apps
 * @copyright 2011 - Intel
 *
 */
(function($) {
    var cache = [];

    var objId= function(obj) {
        if(!obj.jqmSortableId) obj.jqmSortableId=$.uuid();
        return obj.jqmSortableId;
    }

    $.fn.sortable = function(opts) {
        var tmp, id;

        for (var i = 0; i < this.length; i++) {
            //cache system
            id = objId(this[i]);
            if(!cache[id]){
                tmp = new sortable(this[i], opts);
                cache[id] = tmp;
            } else { 
                tmp = cache[id];
            }
        }
        return this.length == 1 ? tmp : this;
    };

    var _event = {
        target: function(evt) {
            var target = false;
            if(evt instanceof MouseEvent)
            {
              target = evt.target;
            }
            else if(evt instanceof TouchEvent)
            {
              target = evt.touches[0].target;
            }

            return target;
        },

        get_pos: function(evt) {
            var posx = 0;
            var posy = 0;
            if (!e) var e = window.event;
            if (e.pageX || e.pageY)   {
              posx = e.pageX;
              posy = e.pageY;
            }
            else if (e.screenX || e.screenY)  {
              posx = e.screenX;
              posy = e.screenY;
            }

            return {x: posx, y: posy};
        }
    };

    var defaults = {
        overlap: 'ui-overlap',
        dragged: 'ui-dragged',
        placeholder: 'ui-placeholder',
        after_drag: function(elem) { 
          console.log($(elem).html());
          },
        on_drag: false,
        before_drag: false
    };

    var sortable = (function() {
        var sortable = function(containerEl, opts) {
            if (typeof containerEl === "string" || containerEl instanceof String) {
                this.container = document.getElementById(containerEl);
            } else {
                this.container = containerEl;
            }
            if (!this.container) {
                alert("Error finding container for sortable " + containerEl);
                return;
            }
            if (this instanceof sortable) {
                for (var j in opts) {
                    if (opts.hasOwnProperty(j)) {
                        this[j] = opts[j];
                    }
                }
            } else {
                return new sortable(containerEl, opts);
            }

            var that = this;
            this.li = [];

            jq(this.sortable).bind('destroy', function(e){
                var id = that.sortable.jqmSortableId;
                // window event need to be cleaned up manually, 
                // remaining binds are automatically killed in 
                // the dom cleanup process
                if(cache[id]) delete cache[id];
                e.stopPropagation();
            });
           
            // initial setup
            var $container=$(this.container);
            var data = Array.prototype.slice.call(this.container.childNodes);
            while(data.length>0)
            {
                var myEl=data.splice(0,1);
                myEl=$container.find(myEl)
                if(!myEl.is('li'))
                   continue;
                
                var li_offset = myEl.offset();
                this.li.push({elem: myEl, offset: li_offset}); 
                myEl.bind('touchmove', function(e) {that.drag(e);});
                myEl.bind('touchend', function(e) {that.drag_end(e);});
                myEl.bind('touchstart', function(e) {that.drag_start(e);});

                myEl.bind('mousemove', function(e) {that.drag(e);});
                $(document).bind('mouseup', function(e) {that.drag_end(e);});
                myEl.bind('mousedown', function(e) {that.drag_start(e);});
            }


        };

        sortable.prototype = {
            dragging: false,

            offset: {x: 0, y: 0},

            overlay: -1,

            li:[],

            default_options: {},

            placeholder: false,
            target: false,
            elem: false,
            elem_idx: -1,

            log: function(message) {
                $('#log').append('<li>'+message+'</li>');
            },

            drag_start: function(evt) {
                this.elem_idx = this.index(_event.get_pos(evt));
                if(this.elem_idx >= 0 && !this.dragging) {
                    var that = this;
                    this.dragging = true;
                    this.elem = $(_event.target(evt));
                    if(defaults.before_drag) {
                        defaults.before_drag(this.elem, function() {
                            $(that.elem).addClass(defaults.dragged);
                            that.target = that.detach_elem(that.elem, evt);
                            that.create_placeholder(that.elem);
                        });
                    }
                    else
                    {
                      $(this.elem).addClass(defaults.dragged);
                      this.target = this.detach_elem(this.elem, evt);
                      this.create_placeholder(this.elem);
                    }
                }
            },

            drag_end: function(evt) {
                var overlap = this.is_overlapping(this.target, pos)
                var elem_changed = false;
                if(overlap >= 0) {
                    this.change_elements(overlap);
                    var elem_changed = true;
                }
                this.attach_elem();
                this.destroy_placeholder();
                $('.'+defaults.overlap).removeClass(defaults.overlap);
                $('.'+defaults.dragged).removeClass(defaults.dragged);
                this.target = false;
                this.dragging = false;
                if(defaults.after_drag) {
                    defaults.after_drag(this.li[overlap]);
                }

            },

            drag: function(evt) {
                if(this.dragging) {
                    pos = _event.get_pos(evt);
                    target = _event.target(evt);
                    this.move_elem(this.target, pos.x, pos.y);
                    var overlap = this.is_overlapping(this.target, pos)
                    this.highligh_overlap(overlap);
                }
            },

            highligh_overlap: function(idx) {
              $('.'+defaults.overlap).removeClass(defaults.overlap);
              if(idx >= 0)
              {
                $(this.li[idx]['elem']).addClass(defaults.overlap);
              }
            },


            detach_elem: function(elem, evt) {
                pos = _event.get_pos(evt);
                target = $(elem).clone();
                $(elem).parent().append(target);
                elem_pos = $(elem).offset();
                parent_pos = $(elem).parent().offset();

                this.offset.x = pos.x - elem_pos.left;
                this.offset.y = pos.y - elem_pos.top;

                $(target).css({position: 'absolute'});

                this.move_elem(target, pos.x, pos.y);
                return target;
            },

            change_elements: function(pos) {
                var idx = this.elem_idx;
                if(idx < 0) return;
                var dragged = this.li[idx]['elem'];
                var overlap = this.li[pos]['elem'];
                
                this.li[idx]['elem'] = overlap;
                this.li[pos]['elem'] = dragged;

                $(dragged).insertBefore(overlap);
                $(this.placeholder).insertBefore(overlap);
                
                if(idx == 0)
                {
                    $(dragged).parent().prepend(overlap);
                }
                else
                {
                    $(overlap).insertAfter(this.li[idx - 1]['elem']);
                }

                this.elem_idx = pos;
            },

            is_overlapping: function(elem, pos) {
                var overlap = -1;
                idx = this.index(pos);
                if(idx >= 0 && idx != this.elem_idx)
                {
                  overlap = idx;
                }
                return overlap;
            },

            index: function(pos) {
                var offset;
                for (var i = 0; i < this.li.length; i++) {
                    offset = this.li[i]['offset'];
                    if(offset.top <= pos.y && (offset.top+offset.height) >= pos.y) {
                        if(offset.left <= pos.x && (offset.left+offset.width) >= pos.x) {
                          return i;
                        }
                    }
                };

                return -1;
            },

            move_elem: function(elem, x, y) {
                elem_pos = $(elem).offset();
                var real_x = x - this.offset.x;
                    real_y = y - this.offset.y;

                $(elem).css({top: real_y + 'px',
                             left: real_x + 'px'});
            },

            attach_elem: function() {
                $(this.target).remove();
            },

            create_placeholder: function(elem) {
                var placeholder = $('<li>.</li>');
                $(placeholder).addClass(defaults.placeholder);
                $(placeholder).css({width: $(elem).width(),
                                    height: $(elem).height()});

                $(placeholder).insertAfter($(elem));
                $(elem).hide();

                this.placeholder = placeholder;
                return placeholder;
            },

            destroy_placeholder: function() {
                if(this.placeholder) {
                    $(this.elem).show()
                    $(this.placeholder).remove();
                    this.placeholder = false;
                }
            }
        };

        return sortable;
    })();

})(jq);
