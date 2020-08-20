/*==============================================================
    pull menu
 ==============================================================*/

function bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
        el.attachEvent('on' + eventName, eventHandler);
    }
}

function layerMenu() {

    var navtemplate =
        + '            <nav id="layer-panel" class="menu navigation-menu">                                      '
        + '                <div class="col-md-12 navbar-header no-padding clearfix text-center xs-text-left">   '
        + '                    <a class="no-padding section-link">Layer navigator</a>                           '
        + '                </div>                                                                               '
        + '                <div class="col-md-12 no-padding clearfix">                                          '
        + '                    <div class="no-padding" id="layer-navigator">                                    '
        + '                        <ul class="nav navbar-default navbar-nav">                                   '
        + '                        </ul>                                                                        '
        + '                    </div>                                                                           '
        + '                </div>                                                                               '
        + '            </nav>                                                                                   '
        + '            <button class="close-button" id="close-layers-button">Close Menu</button>                ';

    //var buttontemplate = '<button class="menu-button" id="open-layers-button" style="margin: 10px 70px;">Open Menu</button>';


    var bodyEl = document.body,
        lmenu = document.createElement('div'),
        openbtn = document.createElement('button'),
        isOpen = false;

    lmenu.className = "menu-wrap pull-menu";
    lmenu.innerHTML = navtemplate;
    bodyEl.insertAdjacentElement('afterBegin', lmenu);

    closebtn = document.getElementById("close-layers-button");

    openbtn.className = "menu-button";
    openbtn.id = "open-layers-button";
    openbtn.style.marginTop = '10px';
    bodyEl.insertAdjacentElement('afterBegin', openbtn);
    

    function init() {

        initEvents();
    }

    function initEvents() {
        if (openbtn) {
            bindEvent(openbtn, 'click', toggleMenu);
        }
        if (closebtn) {

            bindEvent(closebtn, 'click', toggleMenu);
        }

    }

    function toggleMenu() {

        if (isOpen) {
            classie.remove(bodyEl, 'show-menu');
             if ( $( ".full-width-pull-menu" ).length ) {
                 classie.remove(bodyEl, 'overflow-hidden');
            }
        }
        else {
            classie.add(bodyEl, 'show-menu');
            
            if ( $( ".full-width-pull-menu" ).length ) {
                 classie.add(bodyEl, 'overflow-hidden');
            }
           
        }
        isOpen = !isOpen;
    }

    //init();

};