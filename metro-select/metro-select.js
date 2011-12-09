(function($){
    $.fn.metroSelect = function(options) {
        var settings = $.extend( {
            'peeking'           : '2',
            'active-class'      : 'sel-active',
            'onchange'          : function(){}
        }, options);

        var sel = $("<div id='selector'><div id='inner-selector'></div></div>");
        var select = $("#select-box");
        select.parent().append(sel);
        isel = $("#inner-selector");
        
        var original_val = select.val();
        select.hide();
        select.val(original_val);
        var max_width = 0;
        var total_width = 0;
        select.children().each(function(key, val) {
            var opt = $("<span class='sel-opt' id='sel-" + key + "'>" + val.text + "</span>");
            isel.append(opt);
            max_width = Math.max(max_width, opt.width());
            total_width += opt.width();
        });
        
        //left side button
        $("#sel-0").click(function () {
            var select = $("#select-box");
            //if left button clicked, swipe left
            if(select.val() != $("#sel-0")) { 
                select.val($("#sel-0").text());
                $("#sel-0").addClass('sel-active');
                $("#sel-1").removeClass("sel-active");
                $("#selector").animate({scrollLeft: 0}, "fast");
                settings.onchange();
            }
        });

        //right side button
        $("#sel-1").click(function () {
            var select = $("#select-box");
            //if the right button clicked swipe right
            if(select.val() != $("#sel-1")) { 
                select.val($("#sel-1").text());
                $("#sel-0").removeClass('sel-active');
                $("#sel-1").addClass('sel-active');
                $("#selector").animate({scrollLeft: $("#sel-1").offset().left}, "fast");
                settings.onchange();
            }
        });
            
        //set the default visibilities
        if(select.val() == $("#sel-1").text()) { 
            $("#sel-1").click();
        } else {
            $("#sel-0").click();
        }

        //setup the view and show what needs to be shown
        isel.css('width', total_width);
        sel.css('height', $("sel-opt").css('font-size'));
        sel.css('width', max_width + max_width/parseInt(settings['peeking']));
        sel.css('overflow', 'hidden');
    };
})(jQuery);
