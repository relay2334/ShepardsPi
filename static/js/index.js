$(function() {
  $('.grid-stack').gridstack({
    animate: true
  })});

	this.saveGrid = function () {
                  alert("save grid");
                    this.serializedData = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
                        el = $(el);
                        var node = el.data('_gridstack_node');
                        return {
                            x: node.x,
                            y: node.y,
                            width: node.width,
                            height: node.height
                        };
                    }, this);
                    $('#saved-data').val(JSON.stringify(this.serializedData, null, '    '));
                    
                    if (typeof(Storage) !== "undefined") {
                      localStorage.setItem("dashboard", JSON.stringify(this.serializedData));
                      
                    } else {
                        alert("Sorry, your browser does not support Web Storage!");
                    }
                                                     
                    return false;
                    
                }.bind(this);

//serialization: https://codepen.io/frommichael/pen/vmXXLV

//sidebar
//https://codepen.io/nord-txd/pen/ZVjGpL?page=1&
//https://codepen.io/maziarzamani/pen/eJKGvj
