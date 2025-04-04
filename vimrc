" by shacon

"---------------general-------------
set nocompatible
set encoding=UTF-8
filetype on
filetype plugin indent on
set spell
set mouse=a
set number
set cursorline
set cursorcolumn
set showcmd
set showmatch
set nowrap
set nobackup
set wildmenu
set history=1000
set tabstop=4 shiftwidth=4 expandtab smarttab
set autoindent smartindent cindent
set hlsearch incsearch ignorecase smartcase
syntax enable
set list
set listchars=tab:>-,trail:-
set ttimeoutlen=50
set autoread
au FocusGained,BufEnter * silent! checktime

function! SwitchToEnglish()
    if trim(system("fcitx5-remote")) == "2"
        call system("fcitx5-remote -c")
    endif
endfunction

autocmd FocusGained * call SwitchToEnglish()

function! SetColorColumn()
    if &filetype =~# '\v^(c|cpp|h|python)$'
        set colorcolumn=80,120
    else
        set colorcolumn=
    endif
endfunction

autocmd BufEnter * call SetColorColumn()
autocmd FileType * call SetColorColumn()
highlight ColorColumn ctermbg=242 guibg=Grey40

"---------------keybinds------------
nnoremap <SPACE> <Nop>
let mapleader=" "
nmap <leader>w :w!<cr>
command! W execute 'w !sudo tee % > /dev/null' <bar> edit!

map <Left> <Nop>
map <Right> <Nop>
map <Up> <Nop>
map <Down> <Nop>

map <leader>h ^
map <leader>l $
map <leader>k <C-U>
map <leader>j <C-D>

map <Esc>h <c-w>h
map <Esc>j <c-w>j
map <Esc>k <c-w>k
map <Esc>l <c-w>l

inoremap jj <Esc>:w<CR>

nnoremap <Esc>x :bdelete<CR>
inoremap <Esc>x <Esc>:bdelete<CR>

nnoremap <leader>q :close<CR>
nnoremap <leader>o :only<CR>
noremap <leader>y :w !wl-copy<CR><CR>
noremap <leader>p :r !wl-paste<CR>
nnoremap <leader>s :split<CR>
nnoremap <leader>v :vsplit<CR>

" reload vim
nnoremap <leader>r :source $MYVIMRC<cr>

autocmd BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | execute "normal! g'\"" | endif

nmap <leader><leader>l :call CycleLineNumbers()<CR>
function! CycleLineNumbers()
    if (&number == 1 && &relativenumber == 0)
        set relativenumber
    else
        set number
        set norelativenumber
    endif
endfunc

"----------------comment----------------
let g:py_header_comment = [
            \ '"""',
            \ '%DESC%.',
            \ '',
            \ '@history',
            \ ' %DATE% %AUTHOR% Created.',
            \ '',
            \ 'Copyright (c) %YEAR%~ %AUTHOR%.',
            \ '"""',
            \'',
            \''
            \]

let g:c_header_comment = [
            \ '/**',
            \ ' * %DESC%.',
            \ ' *',
            \ ' * @history',
            \ ' *  %DATE% %AUTHOR% created.',
            \ ' *',
            \ ' * Copyright (c) %YEAR%~ %AUTHOR%',
            \ ' */',
            \ '',
            \ ''
            \]

let g:py_function_comment = [
            \ '"""%DESC%',
            \ '',
            \ 'Args',
            \ '    name <type> (shape) [io] desc.',
            \ '    name <type> (shape) [io] desc (0, 10].',
            \ '    name <type> (shape) [io] desc {value: desc, value: desc}.',
            \ '',
            \ 'Returns',
            \ '    <type>: desc',
            \ '"""',
            \ ''
            \]

let g:c_function_comment = [
            \ '/**',
            \ ' * %DESC%.',
            \ ' *',
            \ ' * @param name <type> (shape) [io] desc.',
            \ ' * @param name <type> (shape) [io] desc (0, 10].',
            \ ' * @param name <type> (shape) [io] desc {value: desc, value: desc}.',
            \ ' * @return <type> desc.',
            \ ' */',
            \ ''
            \]

function! GetHeaderCommentTemplate()
    if &filetype == 'python'
        return g:py_header_comment
    elseif &filetype == 'c' || &filetype == 'cpp'
        return g:c_header_comment
    else
        return []
    endif
endfunction

function! GetFunctionCommentTemplate()
    if &filetype == 'python'
        return g:py_function_comment
    elseif &filetype == 'c' || &filetype == 'cpp'
        return g:c_function_comment
    else
        return []
    endif
endfunction

function! InsertHeaderComment()
    let template = GetHeaderCommentTemplate()
    if empty(template)
        echo 'No template defined for this file type.'
        return
    endif

    let author = $USER
    let date = strftime('%Y-%m-%d')
    let year = strftime('%Y')
    let desc = input('Header description: ')

    let template = substitute(join(template, "\n"), '%DESC%', desc, 'g')
    let template = substitute(template, '%AUTHOR%', author, 'g')
    let template = substitute(template, '%DATE%', date, 'g')
    let template = substitute(template, '%YEAR%', year, 'g')

    call append(0, split(template, "\n"))
endfunction

function! InsertFunctionComment()
    let template = GetFunctionCommentTemplate()
    if empty(template)
        echo 'No function comment template defined for this file type.'
        return
    endif

    let func_name = expand('<cword>')
    let desc = input('Function description: ')

    let template = substitute(join(template, "\n"), '%DESC%', desc, 'g')
    if &filetype == 'python'
        let indent = matchstr(getline('.'), '^[ \t]*')
        let template_lines = split(template, "\n")
        let template_lines = map(template_lines, 'v:val == "" ? v:val : indent . v:val')
        let template = join(template_lines, "\n")
        call append(line('.'), template_lines)
    else
        call append(line('.') - 1, split(template, "\n"))
    endif
endfunction

autocmd FileType * nnoremap <Esc><C-h> :call InsertHeaderComment()<ESC>
autocmd FileType * nnoremap <Esc><C-i> :call InsertFunctionComment()<ESC>

"----------------fold-----------------
set foldenable
set foldmethod=indent
set foldlevel=99
let g:FoldMethod = 0
map <leader>zz :call ToggleFold()<cr>
fun! ToggleFold()
    if g:FoldMethod == 0
        exe "normal! zM"
        let g:FoldMethod = 1
    else
        exe "normal! zR"
        let g:FoldMethod = 0
    endif
endfun

"----------------fcitx----------------
if exists('g:fcitx_auto')
    finish
endif
let g:fcitx_auto = 1
let s:r_status = 1
let s:f_status = system("fcitx-remote")
let s:cmd = s:f_status == 1 || s:f_status == 2 ? "fcitx-remote" : "fcitx5-remote"

function s:fcitx2en()
    let l:lang = system(s:cmd)
    if l:lang == 2
        call system(printf("%s -c", s:cmd))
        let s:r_status = 2
    else
        let s:r_status = 1
    endif
endfunction

function s:fcitx2back()
    if s:r_status == 1
        call system(printf("%s -c", s:cmd))
    else
        call system(printf("%s -o", s:cmd))
    endif
endfunction
autocmd InsertLeave * call <SID>fcitx2en()
autocmd InsertEnter * call <SID>fcitx2back()

"----------------pro----------------
if filereadable(expand($HOME . '/.vimrc.pro'))
    source $HOME/.vimrc.pro
endif
