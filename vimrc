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

"----------------netrw----------------
let g:netrw_browse_split = 4
let g:netrw_altv = 1
let g:netrw_banner=0
let g:netrw_liststyle=3
let g:netrw_showhide=1
let g:netrw_winsize=20
map <leader>e :Lex<CR>
let g:netrw_mousemaps = 0

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
