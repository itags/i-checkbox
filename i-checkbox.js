module.exports = function (window) {
    "use strict";

    require('./css/i-checkbox.css');
    require('itags.core')(window);

    var itagName = 'i-checkbox', // <-- define your own itag-name here
        ITSA = window.ITSA,
        Event = ITSA.Event,
        laterSilent = ITSA.laterSilent,
        DEFAULT_ON_TEXT = 'I',
        DEFAULT_OFF_TEXT = 'O',
        SUPPRESS_DELAY = 50,
        Itag, IFormElement;

    if (!window.ITAGS[itagName]) {

        ITSA.DD.init();

        IFormElement = require('i-formelement')(window);

        Event.before(itagName+':manualfocus', function(e) {
            // the i-select itself is unfocussable, but its button is
            // we need to patch `manualfocus`,
            // which is emitted on node.focus()
            // a focus by userinteraction will always appear on the button itself
            // so we don't bother that
            var element = e.target;
            e.preventDefault();
            element.itagReady().then(
                function() {
                    var focusNode = element.getElement('>div');
                    focusNode && focusNode.focus(true, true);
                }
            );
        });

        Event.after('tap', function(e) {
            var element = e.target,
                model = element.model,
                focusNode;
            if (!element.hasData('_suppressTap')) {
                model.checked = !model.checked;
                focusNode = element.getElement('>div');
                focusNode.hasFocus() || focusNode.focus();
            }
        }, 'i-checkbox');

        Event.after('keypress', function(e) {
            var element = e.target,
                model = element.model;
            (e.charCode===32) && (model.checked=!model.checked);
        }, 'i-checkbox');

        Event.after('dd-drag', function(e) {
            var checkbox = e.target.inside('i-checkbox');
            checkbox.setData('_suppressTap', true);
        }, 'i-checkbox');

        Event.after('dd-drop', function(e) {
            var dragNode = e.target,
                checkbox = dragNode.inside('i-checkbox'),
                btnNode = dragNode.getElement('>.i-btn'),
                distance = btnNode.left - checkbox.left - checkbox.getData('_leftBorder') + Math.round(checkbox.getData('_height')/2);
            checkbox._switchUIState(distance>Math.round(checkbox.getData('_width')/2));
            laterSilent(function() {
                checkbox.removeData('_suppressTap');
            }, SUPPRESS_DELAY);
        }, 'i-checkbox');

        Itag = IFormElement.subClass(itagName, {
            attrs: {
                checked: 'boolean',
                'reset-value': 'boolean'
            },

            init: function() {
                var element = this,
                    value = element.model.checked || false,
                    designNode = element.getDesignNode(),
                    options = designNode.getAll('>option'),
                    content, innerDiv, borderLeftWidth;
                element.defineWhenUndefined('value', value);
                // set the reset-value to the inital-value in case `reset-value` was not present
                element.defineWhenUndefined('reset-value', value);
                element.defineWhenUndefined('onText', options[0] ? options[0].getHTML() : DEFAULT_ON_TEXT);
                element.defineWhenUndefined('offText', options[1] ? options[1].getHTML() : DEFAULT_OFF_TEXT);

                content = '<div tabindex="0">'+
                              '<div class="i-constrain">'+
                                  '<div class="i-container" dd-draggable="true" dd-handle=".i-btn" constrain-selector=".i-constrain">'+
                                      '<div class="i-on">I</div>'+
                                      '<div class="i-off">O</div>'+
                                      '<div class="i-btn"></div>'+
                                  '</div>'+
                              '</div>'+
                          '</div>';
                element.setHTML(content);
                innerDiv = element.getElement('>div');
                borderLeftWidth = parseInt(innerDiv.getStyle('border-left-width'), 10);
                element.setData('_leftBorder', borderLeftWidth);
                element.setData('_vertBorders', parseInt(innerDiv.getStyle('border-top-width'), 10) + parseInt(innerDiv.getStyle('border-bottom-width'), 10));
                element.setData('_horBorders', borderLeftWidth + parseInt(innerDiv.getStyle('border-right-width'), 10));
            },

            _fitCheckbox: function() {
                var element = this,
                    width = element.offsetWidth,
                    height = element.offsetHeight,
                    innerDiv, constrainNode, innerNodes, halfHeight, shift;
                if ((width!==element.getData('_width')) || (height!==element.getData('_height'))) {
                    // the height that should be used by the innernodes, schould be decreased by the border-width
                    height -= element.getData('_vertBorders');
                    width -= element.getData('_horBorders');
                    innerDiv = element.getElement('>div');
                    constrainNode = innerDiv.getElement('>div');
                    innerNodes = constrainNode.getAll('>div >div');
                    halfHeight = Math.round(height/2);
                    shift = 3*Math.round(height/4);
                    innerDiv.setInlineStyle('border-radius', height+'px');
                    constrainNode.setInlineStyles([
                        {property: 'left', value: (height-width)+'px'},
                        {property: 'width', value: (3*width-height)+'px'}
                    ]);
                    innerNodes[0].setInlineStyles([
                        {property: 'border-radius', value: height+'px'},
                        {property: 'line-height', value: (height-2)+'px'}, // correct with 2px: the padding-top of i-on
                        {property: 'padding-right', value: shift+'px'},
                        {property: 'width', value: width+'px'}
                    ]);
                    innerNodes[1].setInlineStyles([
                        {property: 'border-radius', value: height+'px'},
                        {property: 'margin-left', value: -height+'px'},
                        {property: 'line-height', value: (height-2)+'px'}, // correct with 2px: the padding-top of i-off
                        {property: 'padding-left', value: shift+'px'},
                        {property: 'width', value: width+'px'}
                    ]);
                    innerNodes[2].setInlineStyles([
                        {property: 'left', value: -width+'px'},
                        {property: 'height', value: height+'px'},
                        {property: 'width', value: height+'px'}
                    ]);
                    element.setData('_width', width);
                    element.setData('_height', height);
                }
            },

            _switchUIState: function(enabled) {
                var element = this,
                    container = element.getElement('>div >div >div');
                container.setInlineStyle('left', enabled ? (element.getData('_width')-element.getData('_height'))+'px' : '0');
            },

            sync: function() {
                var element = this,
                    container = element.getElement('>div >div >div'),
                    itemContainers = container.getAll('>div'),
                    model = element.model;
                element._fitCheckbox();
                element._switchUIState(model.checked);
                itemContainers[0].setHTML(model.onText);
                itemContainers[1].setHTML(model.offText);
            },

            reset: function() {
                var model = this.model;
                model.value = model['reset-value'];
                // no need to call `refreshItags` --> the reset()-method doesn't come out of the blue
                // so, the eventsystem will refresh it afterwards
            },

            destroy: function() {
            }
        });

        window.ITAGS[itagName] = Itag;
    }

    return window.ITAGS[itagName];
};
