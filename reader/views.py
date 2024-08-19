from django.http import HttpResponse, HttpResponseRedirect
from .models import *
from django.views import generic
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.decorators import login_required
from . import form_book

class BookListView(generic.ListView):
    template_name = 'book_list.html'
    context_object_name = 'book_list'

    def get_queryset(self):
        """Return the last five published questions."""
        if self.request.user.is_authenticated:
            books = Book.objects.filter(share = True) | Book.objects.filter(uploader = self.request.user.id)
            for bk in books:
                last = UserBookRecord.objects.filter(user_id = self.request.user.id , book_id = bk.id).order_by('-read_time')
                if len(last) > 0:
                    bk.cur_chapter_title = last[0].chapter_title
                else:
                    bk.cur_chapter_title = '未开始'
            return books
        else:
            print(Book.objects.filter(share = True))
            return Book.objects.filter(share = True)
        

 
# def book_reader(request,book_pk):
#     if  request.method == 'POST':
#         if not request.user.is_authenticated:
#             return HttpResponse('required login')  
        
        
#     _book = get_object_or_404(Book,id = int(book_pk))
#     if _book.share != True and _book.uploader != request.user.id:
#         return redirect('reader:index')

#     chapter_list = Chapter.objects.filter(book_id = book_pk)

#     cur_chpt = chapter_list[len(chapter_list)-1]
#     offset = 0
#     with open(_book.book_url,'r',encoding=_book.charset) as f:
#         # f.seek(cur_chpt.start+2 )
#         content = f.read()[cur_chpt.start :cur_chpt.end]
#         # print(content)
#         content = content.split('\n')
#         return render(request, 'book_reader.html', {'chapter_title':cur_chpt.title,'chapter_list':chapter_list,'content_lines':content,'progess':20})


@login_required(login_url='reader:index')
def upload_file(request):
    if  request.method == 'POST':
        handle_uploaded_file(request)
        return render(request, 'upload_file.html', {'notice':"succeed"})
    return render(request, 'upload_file.html')




@login_required(login_url='reader:index')
def BookAdminView(request):
    if request.user.is_superuser == 1:
        books = Book.objects.all()
    else:
        books = Book.objects.filter(uploader = request.user.id)
    return render(request, 'book_admin.html', {'book_list': books})


class ChapterListView(generic.ListView):
    template_name = 'chapter_list.html'
    context_object_name = 'chapter_list'

    def get_queryset(self):
        _book =  get_object_or_404(Book,id = self.kwargs['pk'])
        if _book.uploader == 0:
            return Chapter.objects.filter(book_id=self.kwargs['pk'])
        if self.request.user.is_authenticated and self.request.user.id == _book.uploader :
            return Chapter.objects.filter(book_id=self.kwargs['pk'])
        return Chapter.objects.none()

        
        

class BookmarkListView(generic.ListView):
    template_name = 'bookmark_list.html'
    context_object_name = 'bookmark_list'

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.id == self.kwargs['user_id']:
            return UserBookMark.objects.filter(book_id=self.kwargs['book_id'],user_id =self.kwargs['user_id']).order_by('-add_time')
        else:
            return UserBookMark.objects.none()

class ChapterDetailView(generic.DetailView):
    # template_name = 'chapter_detail.html'
    # model: Content

    def get_queryset(self):
        # return Content.objects.filter(pk=self.kwargs['pk'])
        return

class IndexView(generic.TemplateView):
    template_name = 'index.html'


def book(request,pk):
    if request.user.is_authenticated:
        last = UserBookRecord.objects.filter(user_id = request.user.id , book_id = pk).order_by('-read_time')
        if len(last) > 0:
            print(last)
            last = last[0]
            return redirect('reader:book_reader',pk,last.chapter_id)
    _book =  get_object_or_404(Book,id = pk)
    if _book.share == True or _book.uploader==request.user.id:
        return redirect('reader:book_reader',book_pk=pk,chapter_pk=_book.first_chapter_id)
    return redirect('reader:index')


@login_required(login_url='reader:index')
def book_reader_offset(request,book_pk,chapter_pk,offset=0):
    _book = get_object_or_404(Book,id = int(book_pk))
    if _book.share!=True and _book.uploader != request.user.id:
        return redirect('reader:index')

    chapter_list = Chapter.objects.filter(book_id = book_pk)
    chapter = get_object_or_404(Chapter,pk = chapter_pk)

    content = 'NULL'
    with open(_book.book_url,'r',encoding=_book.charset) as f:
        content = f.read()[chapter.start :chapter.end]
        
    if content[:len(chapter.title)] == chapter.title:
        content = content[len(chapter.title):]
    content = content.strip().split('\n')

    if request.user.is_authenticated :
        print(offset)
        user_setting = get_object_or_404(UserSetting,user_id = request.user.id)
        return render(request, 'book_reader.html', {'chapter_title':chapter.title,'chapter_list':chapter_list,'content_lines':content,'last_words':offset,
            'user_setting':user_setting,'progess':progress(book_pk,chapter_pk)})
    else:
        return render(request, 'book_reader.html', {'chapter_title':chapter.title,'chapter_list':chapter_list,'content_lines':content,'progess':progress(book_pk,chapter_pk)})



def progress(book_id,chapter_id):
    chapter_list = Chapter.objects.filter(book_id = book_id).order_by('index')
    book = Book.objects.filter(id=book_id)[0]
    all = book.word_count
    read = 0.0
    
    for ch in chapter_list:
        if chapter_id == ch.id:
            break
        read+=ch.end - ch.start
    return read/all *100 
    
def book_reader(request,book_pk,chapter_pk):
    if  request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponse('required login')  
        
        if 'words' in request.POST:
            records = UserBookRecord.objects.filter(user_id =request.user.id, book_id =book_pk)
            if len(records) == 0:
                UserBookRecord(user_id =request.user.id, book_id =book_pk, chapter_id = chapter_pk, words_read = int(request.POST['words'])).save()
            else:

                records[0].chapter_id = chapter_pk
                records[0].chapter_title = Chapter.objects.filter(id = chapter_pk)[0].title
                records[0].words_read = int(request.POST['words'])
                records[0].save()

            return HttpResponse('success')  
        if 'kwd' in request.POST:
            return keyword_search(request,book_pk,chapter_pk,str(request.POST['kwd']))
    if request.user.is_authenticated :
        UserBookRecord.objects.filter(user_id =request.user.id, book_id =book_pk)
        last = UserBookRecord.objects.filter(user_id = request.user.id , book_id = book_pk).order_by('-read_time')
        if len(last) > 0 and last[0].chapter_id == chapter_pk:
            return book_reader_offset(request,book_pk,chapter_pk,last[0].words_read)
            
    return book_reader_offset(request,book_pk,chapter_pk)
    

def login_auth(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        setting = UserSetting.objects.filter(user_id = user.id)
        if len(setting) == 0:
            UserSetting(user_id = user.id).save()
        if user is not None:
            login(request, user)
            return HttpResponse('success')  
        else:
            return HttpResponse('请输出正确的用户名或密码')  

    return HttpResponse('fk off')  


def logout_view(request):
    logout(request)
    return redirect('reader:book_list')
    # Redirect to a success page.

def book_del(request,pk):
    _book = get_object_or_404(Book,id = pk)
    if request.user.is_superuser or request.user.id == _book.uploader:
        chapter_list = Chapter.objects.filter(book_id = pk)
        chapter_list.delete()
        UserBookRecord.objects.filter(book_id = pk).delete()
        Book.objects.filter(id = pk).delete()
    return redirect('reader:book_admin')


class search_item:
    def __init__(self,book,chapter,cont,off):
        self.book_pk = book
        self.chapter_pk = chapter
        self.content = cont
        self.offset = off

def keyword_search(request,book_pk,chapter_pk,kwd):
    _book = get_object_or_404(Book,id = int(book_pk))
    if _book.share!=True and _book.uploader != request.user.id:
        return redirect('reader:index')
    
    if len(kwd)==0:
        return render(request, 'search.html', {'list': []})
    
    chapter_list = Chapter.objects.filter(book_id = book_pk).order_by('index')
    search_list = []
    
    content = 'NULL'
    with open(_book.book_url,'r',encoding=_book.charset) as f:
        content = f.read()
    chpt_idx = 0
    idx=content.find(kwd)
    while idx!=-1:

        res_len = 100
        res_cont = content[idx-100:idx+100]
        res_cont_lns = res_cont.split('\n')
        target_ln_cnt = 0

        for cont_ln in res_cont_lns:
            target_ln_cnt+=len(cont_ln)+1
            if target_ln_cnt>res_len:
                res_cont = cont_ln
                break

        for _idx in range(chpt_idx,len(chapter_list)):
            if idx >= chapter_list[_idx].start and idx <= chapter_list[_idx].end:
                chpt_idx = _idx

        search_list.append(search_item(book_pk,chapter_list[chpt_idx].id,res_cont,idx-chapter_list[chpt_idx].start))
        idx = content.find(kwd,idx+1)
        # break

    return render(request, 'search.html', {'list': search_list})

@login_required(login_url='reader:index')
def update_setting(request):
    if request.method == 'POST':
       
        settings = UserSetting.objects.filter(user_id = request.user.id)
        if len(settings) == 0:
            setting = UserSetting(user_id = request.user.id,font_size = request.POST['font_size'],read_bg = request.POST['read_bg'])
            setting.save()
        else:
            settings[0].font_size = request.POST['font_size']
            settings[0].read_bg = request.POST['read_bg']
            settings[0].save()
        return HttpResponse('ok')  
    return HttpResponse('not login')  

@login_required(login_url='reader:index')
def bookmark_save(request):
    if not request.user.is_authenticated:
        return HttpResponse('not login')  
    
    word_record_len = 200
    if request.method == 'POST':
        user_bookmark = UserBookMark(user_id = request.user.id,book_id = request.POST['book_id'],chapter_id = request.POST['chapter_id'],
            words_read = request.POST['words_read'],content =request.POST['content'][:word_record_len] )
        user_bookmark.save()
        return HttpResponse('ok')  

    
def ret_null(request):
    return HttpResponse('')


def test_requset(request):
    form_book.handle_local_book(request,'temp/《遮天》（精校版全本）作者：辰东.txt')
    return HttpResponse('done')