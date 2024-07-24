
set nocompatible                                    " 设置不兼容原始vi模式
set number                                          " 开启行号显示
set cursorline                                      " 高亮显示当前行
set showcmd                                         " 右下角显示输入的命令
set nowrap                                          " 禁止折行
set wildmenu                                        " vim命名行模式智能补全

set tabstop=4 shiftwidth=4 expandtab smarttab       " 缩进的空格数
set autoindent smartindent cindent                  " 自动缩进设置
set hlsearch incsearch ignorecase smartcase         " 搜索相关设置
filetype plugin indent on                           " 检测文件类型，打开基于文件类型的插件和缩进
syntax enable                                       " 开启语法高亮功能
set list                                            " 显示不可见字符
set listchars=tab:>-,trail:-
set ttimeoutlen=0                                   " 设置<ESC>键响应时间

nnoremap <SPACE> <Nop>
let mapleader=" "                                   " 定义<leader>键

" 强迫自己用 hjkl
map <Left> <Nop>
map <Right> <Nop>
map <Up> <Nop>
map <Down> <Nop>

" 重新加载vimrc文件
nnoremap <leader>r :source $MYVIMRC<cr>

" 分屏窗口移动
map <Leader>j <c-w>j
map <Leader>k <c-w>k
map <Leader>h <c-w>h
map <Leader>l <c-w>l
map <Leader>/ :terminal<CR><C-W>J<C-W>10-
tnoremap <Leader>/ <C-\><C-n>
tnoremap <Leader>j <c-w>j
tnoremap <Leader>k <c-w>k
tnoremap <Leader>h <c-w>h
tnoremap <Leader>l <c-w>l

" 复制当前选中到系统剪切板
vmap <leader><leader>y "+y

" 将系统剪切板内容粘贴到vim
nnoremap <leader><leader>p "+p

" 打开文件自动定位到最后编辑的位置
autocmd BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | execute "normal! g'\"" | endif

" 加载Pro配置
if filereadable(expand($HOME . '/.vimrc.pro'))
    source $HOME/.vimrc.pro
endif


