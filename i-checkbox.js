module.exports = function (window) {
    "use strict";

    require('./css/i-checkbox.css');
    require('itags.core')(window);

    var itagName = 'i-checkbox', // <-- define your own itag-name here
        DOCUMENT = window.document,
        ITSA = window.ITSA,
        Itag, IFormElement;

    if (!window.ITAGS[itagName]) {

        ITSA.DD.init();

        IFormElement = require('i-formelement')(window);

        Itag = IFormElement.subClass(itagName, {
            attrs: {
            },

            init: function() {
                var element = this,
                    content;
/*
                '<div class="yui3-itsacheckbox" style="width: 44px; border-radius: 20px;">'+
                    '<div class="optionwrapper" style="width: 97px; left: -1px;">'+
                        '<div class="optioncontainer yui3-dd-draggable" style="width: 70px; left: 0px;">'+
                            '<div class="optionbtn" style="height: 14px; width: 14px; margin-left: -43px; border-radius: 8px;"></div>'+
                         '</div>'+
                    '</div>'+
                '</div>';
*/
                content = '<div dd-draggable="true" constrain-selector="i-checkbox">'+
                              '<div></div>'+
                          '</div>';
                element.setHTML(content);
            },

            sync: function() {
            },

            destroy: function() {
            }
        });

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];
};
