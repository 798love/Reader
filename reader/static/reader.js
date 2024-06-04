var mobile   = '/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/g'
var isMobile     = navigator.userAgent.match('iP(hone|od|ad)')
var isIOS = navigator.userAgent.match(mobile)
var offcanvasTop = new bootstrap.Offcanvas($('.offcanvas-top'))
var offcanvasLeft = new bootstrap.Offcanvas($('.offcanvas-start'))
var offcanvasBottom = new bootstrap.Offcanvas($('.offcanvas-bottom-all'))
var offcanvasSetting = new bootstrap.Offcanvas($('.offcanvas-bottom-setting'))

var page_width = $('article').width() + parseInt($('article').css('column-gap'))
var page_num = parseInt(($('#marker').offset().left - $('article').offset().left)/ page_width +1)
var page_contents_len = new Array(page_num + 1 ).fill(0);
var modal = new bootstrap.Modal($(".myModal")) // Returns a Bootstrap modal instance\

// if (isIOS)
// {
//     page_num -=1
//     $('article').css('height','95vh')
// }
    

if (isMobile)
{
    if(localStorage.getItem('offcanvasBottom'))
    {
        console.log(localStorage.getItem('offcanvasBottom'))
        $('.offcanvas-bottom-all').addClass("show").css('visibility','visible');
        // offcanvasBottom.show()
    }

    document.getElementById('offcanvasBottom').addEventListener('hide.bs.offcanvas', function () {
        localStorage.removeItem('offcanvasBottom')
    })
    document.getElementById('offcanvasBottom').addEventListener('show.bs.offcanvas', function () {
        localStorage.setItem('offcanvasBottom','ture')
    })
    $('.back-btn').click(function(){
        localStorage.removeItem('offcanvasBottom')
    })

    $('.article-container').click(function(e){
        var menu_w =  $('.center_menu').width()/2
        var menu_h =  $('.center_menu').height()/2
        var client_w =  $('.article-container').width()/2
        var client_h =  $('.article-container').height()/2
        if((e.clientX > client_w +menu_w)||(e.clientY > client_h+menu_h &&e.clientX > client_w-menu_w))
        {
            $('.next-page').click()
        }
        else if((e.clientX < client_w - menu_w)||(e.clientY < client_h - menu_h &&e.clientX < client_w + menu_w))
        {
            $('.prev-page').click()
        }
        else
        {
            $('.center_menu').click()
        }
    })

    $('.center_menu').click(function(e){
    // offcanvasTop.toggle()
        offcanvasBottom.toggle()
    })

    $('.chapter_list_btn').click(function(e){  
        var act = $('.offcanvas-start .offcanvas-body .list-group-item.active ')
        if(act[0])
            {
                if (!act.attr('offset'))
                    act.attr('offset',act.offset().top - act.height()*4)
                $('.offcanvas-start .offcanvas-body').scrollTop(act.offset().top - act.height()*4)
                
            }
        offcanvasBottom.hide()
        offcanvasLeft.show() 
    
    })
    

    var startX;
    var startY;
    var moveEndX
    var moveEndY
    var X
    var Y
    var trans
    var last_page_offset = - parseInt($('#marker').offset().left - $('article').offset().left) 
    $(".article-container").on("touchstart", function (e) {
        startX = e.originalEvent.changedTouches[0].pageX,
        startY = e.originalEvent.changedTouches[0].pageY;
        if($('article').css('transform') == 'none')
            trans = 0
        else
            trans = parseFloat($('article').css('transform').split(',')[4])
    });

    $(".article-container").on("touchmove", function (e) {
        e.preventDefault();
        moveEndX = e.originalEvent.changedTouches[0].pageX
        moveEndY = e.originalEvent.changedTouches[0].pageY
        X = moveEndX - startX
        Y = moveEndY - startY
        $('article').css('transform',`translateX(${trans + X}px)`)
    });

    $(".article-container").on("touchend",function(e){
        moveEndX = e.originalEvent.changedTouches[0].pageX
        moveEndY = e.originalEvent.changedTouches[0].pageY
        X = moveEndX - startX
        Y = moveEndY - startY

        console.log(parseFloat($('article').css('transform').split(',')[4]))
        console.log(last_page_offset)
        if(parseFloat($('article').css('transform').split(',')[4]) > 0)
            $('article').css('transform',`translateX(0px)`)
        else if(parseFloat($('article').css('transform').split(',')[4]) < last_page_offset)
        {
            $('article').css('transform',`translateX(${last_page_offset}px)`)
        }
        
        if (X < 0) {
            $('.next-page').click()
        }
        else if (X > 0) {
            $('.prev-page').click()
        }
    
    })



}
else
{
    $('.chapter_list_btn').click(function(e){  
        var act = $('.offcanvas-start .offcanvas-body .list-group-item.active ')
        console.log(1)
        if(act[0])
        {
            if (!act.attr('offset'))
                act.attr('offset',act.offset().top - act.height()*4)
            $('.offcanvas-start .offcanvas-body').scrollTop(act.offset().top - act.height()*4)
            
        }
        offcanvasLeft.toggle() 
    })
    document.onkeydown=function(e){    //对整个页面监听  
        var keyNum=window.event ? e.keyCode :e.which;       //获取被按下的键值  
        if(keyNum==37){  //left
            $('.prev-page').click()
        }  
        if(keyNum==38){  //up
            $('.page-link.prev-chapter')[0].click()
        }  
        if(keyNum==39 | keyNum == 32){  //right space
            $('.next-page').click()
        } 
        if(keyNum==40){  //down
            $('.page-link.next-chapter')[0].click()
        } 
    } 
}

$('article p').each((i,e)=>{
    page_contents_len[parseInt($(e).offset().left/page_width) + 1]+=$(e).text().length
})
for(var i =1;i<page_num+1;i++)
    page_contents_len[i] += page_contents_len[i-1]
if(page_num>0)
{
    for(var i=0;i<page_num;i++)
    {
        $('.pages-container').prepend($('<li class="page-item page-num"><a class="page-link" href="#">'+ String(page_num-i)+'</a></li>'))   
    }
    $('.pages-container').children().first().addClass('active')
}



$('.prev-chapter').attr('href',$('.list-group-item.active').prev().attr('href'))
$('.next-chapter').attr('href',$('.list-group-item.active').next().attr('href'))

$('.page-item').click(function(e){
    var cur = $('.page-item.active')
    var cur_idx = parseInt(cur.text()) -1
    var all = $('.page-num').length
    if ($(this).hasClass('page-num'))
    {
        cur.removeClass('active')
        $(this).addClass('active')
        cur_idx = parseInt($(this).text()) -1 
        $('article').css('transform',`translateX(-${page_width * cur_idx}px)`)
        save_record()
    }
})

$('.prev-page').click(function(e){
    var cur = $('.page-item.active')
    var cur_idx = parseInt(cur.text()) -1
    var all = $('.page-num').length
    if(cur_idx>0)
    { 
        cur.prev().addClass('active')
        cur.removeClass('active')
        $('article').css('transform',`translateX(-${page_width * (cur_idx - 1 )}px)`)
        save_record()

        
        
    }
    else{
        console.log(cur_idx)
        $('.page-link.prev-chapter')[0].click()
        localStorage.setItem('prev-chapter','true')
    }
})

$('.next-page').click(function(e){
    var cur = $('.page-item.active')
    var cur_idx = parseInt(cur.text()) -1
    var all = $('.page-num').length
    if(cur_idx<all-1)
    {
        
        cur.next().addClass('active')
        cur.removeClass('active')
        $('article').css('transform',`translateX(-${page_width * (cur_idx +1 )}px)`)
        save_record()

        var cur_idx = parseInt() 
        $('.chpt-page').text($('.page-item.active').text()+'/'+page_num)
    }
    else
    {
        $('.page-link.next-chapter')[0].click()
    }
})

function save_record()
{
    $.ajax({
     url: url_book_reader, 
     type: 'post',
     data: {
         'words': page_contents_len[parseInt($('.page-item.active').text()) - 1],
         csrfmiddlewaretoken: csrf_token
     },
     // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
     success: function (data){
     console.log(data);       
     }
 })

}


if(localStorage.getItem('prev-chapter'))
{
    $('.pages-container').children().last().click()
    localStorage.removeItem('prev-chapter')
    save_record()
}
else
{
    save_record()
}

for(var i=0;i<page_num+1;i++)
{
    if(page_contents_len[i]>last_words)
    {
        $('.page-item').each((idx,e)=>{
            if(parseInt($(e).text()) == i)
                $(e).click()
        })
        break
    }
}

$('.content-serarch').on("search", function() {
    // console.log($('.content-serarch').val())
    // console.log($(this).val())
    $.ajax({
     url: url_book_reader, 
     type: 'post',
     data: {
         'kwd': $(this).val(),
         csrfmiddlewaretoken: csrf_token
     },
     // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
     success: function (data){
        $('.search-res').html(data)
        // console.log($('.search-res .active'))
        if($('.search-res .active')[0])
            $('.search-res').scrollTop($('.search-res .active').offset().top)
    //  console.log(data);       
     }
     
    })
 modal.show()
});

$('.search-btn').click(function(){
    modal.show()
})


$('#offcanvassetting').on('show.bs.offcanvas', function () {
    $('.font-value').text(parseInt($('article').css('font-size')))
    // $().addClass('bodder border-4 border-secondary')

        var had_choose = false
        $('.bg-setting').each(function(){
            if($(this).hasClass('bodder border-4 border-secondary'))
                had_choose = true
        })

        $('.bg-setting').each(function(){
            if(!had_choose && $(this).css('background')==user_setting_bg)
                $(this).addClass('bodder border-4 border-secondary')
        })
})
    
    

$('.inc-font').click(function(){
    var font = parseInt($('article').css('font-size'))
    font += 1
    $('.font-value').text(font)
    $('article').css('font-size',font)
})
$('.dec-font').click(function(){
    var font = parseInt($('article').css('font-size'))
    font -= 1
    $('.font-value').text(font)
    $('article').css('font-size',font)
})


$('.bg-setting').click(function(){
    $('main').css('background',$(this).css('background'))
    $('.bg-setting').removeClass('bodder border-4 border-secondary')
    $(this).addClass('bodder border-4 border-secondary')
})

$('.update-setting').click(function(){
    var bg = $('main').css('background')
    if($(this).hasClass('bg-setting'))
        bg = $(this).css('background')

    if ($(this).hasClass('read-black'))
        $('main').css('color','rgb(90,90,90)')

    $.ajax({
     url: url_update_setting, 
     type: 'post',
     data: {
         'font_size': $('.font-value').text(),
         'read_bg':bg,
         csrfmiddlewaretoken: csrf_token
     },
     // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
     success: function (data){
       
     console.log(data);       
     }
     
    })
})

$('.setting-btn').click(function(){
    offcanvasSetting.toggle()
})

$('.bookmark-btn').click(function(){
    var cont =''
    $('article p').each((i,e)=>{
        if(parseInt($(e).offset().left) >0  && parseInt($(e).offset().left)<page_width)
            cont+=$(e).text()
    })
    $.ajax({
     url: url_bookmark_save, 
     type: 'post',
     data: {
         'book_id':book_id,
         'chapter_id':chapter_id,
         'words_read':page_contents_len[parseInt($('.page-item.active').text()) - 1],
         'content':cont,
         csrfmiddlewaretoken: csrf_token
     },
     // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
     success: function (data){
     console.log(data);       
     }
     
    })
})

$('.offcanvas-start').on('show.bs.offcanvas',function(){
    // var act = $('.offcanvas-start .offcanvas-body .list-group-item.active ')
    // if(act[0])
    //     $('.offcanvas-start .offcanvas-body').scrollTop(act.offset().top - act.height()*4)
    // $.ajax({
    //     url: url_chapter_list, 
    //     type: 'get',
    //     // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
    //     success: function (data){
    //         $('.chapter_list_container').html(data)
    //     // console.log(data);       
    //     }
        
    //    })
    $.ajax({
        url: url_bookmark_list, 
        type: 'get',
        // 上面data为提交数据，下面data形参指代的就是异步提交的返回结果data
        success: function (data){
            $('.bookmark_list_container').html(data)
        // console.log(data);       
        }
        
       })
    
})

$('.bookmark-show').click(function(){
    $('.offcanvas-start .offcanvas-body').scrollTop(0)
})





$('.chapter-list-show').click(function(){
    setTimeout(function(){
        var act = $('.offcanvas-start .offcanvas-body .list-group-item.active ')
        if(act[0])
            $('.offcanvas-start .offcanvas-body').scrollTop(act.attr('offset'))
    }, 250);
    
})

var cur_idx = parseInt() 
$('.chpt-page').text($('.page-item.active').text()+'/'+page_num)