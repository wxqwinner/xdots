" curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

call plug#begin('~/.vim/plugged')
    Plug 'dracula/vim', { 'as': 'dracula' } " theme
    Plug 'lilydjwg/fcitx.vim'               " fcitx5
    Plug 'vim-autoformat/vim-autoformat'    " format
    Plug 'vim-airline/vim-airline'          " status bar
    Plug 'tpope/vim-fugitive'               " git
    Plug 'preservim/nerdtree'               " file explorer
    Plug 'ctrlpvim/ctrlp.vim'               " fuzzy search
    Plug 'voldikss/vim-floaterm'            " float terminal
    Plug 'puremourning/vimspector'          " debug

    Plug 'luochen1990/rainbow'              " 彩虹括号
    Plug 'psliwka/vim-smoothie'             " 动态滚动
    Plug 'jiangmiao/auto-pairs'             " 自动补全括号
    Plug 'preservim/nerdcommenter'          " 代码注释
    Plug 'junegunn/vim-easy-align'          " 文本对齐

    Plug 'preservim/tagbar'                 " 查看标签
    Plug 'ludovicchabant/vim-gutentags'     " 自动生成tags文件

call plug#end()

colorscheme dracula

" Plug 'vim-airline/vim-airline'
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#buffer_idx_mode = 1
nmap <leader>1 <Plug>AirlineSelectTab1
nmap <leader>2 <Plug>AirlineSelectTab2
nmap <leader>3 <Plug>AirlineSelectTab3
nmap <leader>4 <Plug>AirlineSelectTab4
nmap <leader>5 <Plug>AirlineSelectTab5
nmap <leader>6 <Plug>AirlineSelectTab6
nmap <leader>7 <Plug>AirlineSelectTab7
nmap <leader>8 <Plug>AirlineSelectTab8
nmap <leader>9 <Plug>AirlineSelectTab9
nmap <leader>0 <Plug>AirlineSelectTab0
nmap <Tab> <Plug>AirlineSelectNextTab
nmap <S-Tab> <Plug>AirlineSelectPrevTab

" Plug 'luochen1990/rainbow'
let g:rainbow_active = 1

" Plug 'preservim/nerdtree'
let NERDTreeShowHidden = 1      "显示隐藏文件
"map <Leader>e :NERDTreeToggle<CR>

" Plug 'preservim/nerdcommenter'
let NERDSpaceDelims = 1

" Plug 'junegunn/vim-easy-align'
" Start interactive EasyAlign in visual mode (e.g. vipga)
xmap ga <Plug>(EasyAlign)
" Start interactive EasyAlign for a motion/text object (e.g. gaip)
nmap ga <Plug>(EasyAlign)

" Plug 'ctrlpvim/ctrlp.vim'
let g:ctrlp_user_command = ['.git', 'cd %s && git ls-files -co --exclude-standard']		" 忽略.gitignore中的文件

" Plug 'preservim/tagbar'
map <leader>m :TagbarToggle<CR>

" Plug 'ludovicchabant/vim-gutentags'
let g:gutentags_cache_dir = "~/.cache/tags"
let g:gutentags_modules = ['ctags']

" float terminal
nnoremap <silent> <Leader>/ :FloatermToggle<CR>
""tnoremap <silent> <Leader>/ <C-\><C-n>:FloatermToggle<CR>"

" update plug and reload vim
nnoremap <leader>r :call system('proxyon')<cr>:PlugUpdate<cr>:source $MYVIMRC<cr>:call system('proxyoff>')<cr>
