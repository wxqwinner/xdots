" curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

call plug#begin('~/.vim/plugged')
    Plug 'dracula/vim', { 'as': 'dracula' } " theme
    Plug 'vim-autoformat/vim-autoformat'    " code format
    Plug 'preservim/nerdcommenter'          " code comment
    Plug 'vim-airline/vim-airline'          " status bar
    Plug 'tpope/vim-fugitive'               " git
    Plug 'airblade/vim-gitgutter'           " git
    Plug 'ctrlpvim/ctrlp.vim'               " fuzzy search
    Plug 'voldikss/vim-floaterm'            " float terminal
    Plug 'preservim/tagbar'                 " show tag bar
    Plug 'ludovicchabant/vim-gutentags'     " auto generate tags
    Plug 'luochen1990/rainbow'              " rainbow
    Plug 'puremourning/vimspector'          " debug
    Plug 'tpope/vim-repeat'                 " repeat
    call plug#end()

    " Plug 'preservim/nerdcommenter'
    let g:NERDCreateDefaultMappings = 1
    let g:NERDSpaceDelims = 1
    let g:NERDCompactSexyComs = 1
    let g:NERDDefaultAlign = 'left'

    " Plug 'vim-airline/vim-airline'
    let g:airline#extensions#tabline#enabled = 1
    let g:airline#extensions#tabline#buffer_idx_mode = 1
    let g:airline#extensions#tabline#formatter = 'default'

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

    " Plug 'ctrlpvim/ctrlp.vim'
    let g:ctrlp_user_command = ['.git', 'cd %s && git ls-files -co --exclude-standard']     " 忽略.gitignore中的文件

    " Plug 'preservim/tagbar'
    map <leader>m :TagbarToggle<CR>

    " Plug 'ludovicchabant/vim-gutentags'
    let g:gutentags_cache_dir = "~/.cache/tags"
    let g:gutentags_modules = ['ctags']

    " Plug ""
    set updatetime=100

    " float terminal
    nnoremap <silent> <Leader>/ :FloatermToggle<CR>
    ""tnoremap <silent> <Leader>/ <C-\><C-n>:FloatermToggle<CR>"

    colorscheme dracula
    au BufWrite * :Autoformat
