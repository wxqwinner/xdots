if exists('g:loaded_project')
    finish
endif
let g:loaded_project = 1

function! project#Init() abort
    let g:sessions_dir = expand('~/.vim/sessions')
    let g:projects = {}
    let g:projects_json = expand('~/.vim/projects.json')

    if !isdirectory(g:sessions_dir)
        call mkdir(g:sessions_dir, 'p')
    endif

    if filereadable(g:projects_json)
        let g:projects = json_decode(join(readfile(g:projects_json)))
    endif

    set sessionoptions=tabpages,winpos,winsize,globals
endfunction

function! project#GetProjectName() abort
    return fnamemodify(getcwd(), ':t')
endfunction

function! project#SaveProject() abort
    let l:project_name = project#GetProjectName()
    let l:session_file = printf('%s/%s.session', g:sessions_dir, substitute(l:project_name, '\s', '_', 'g'))

    execute 'mksession!' l:session_file

    let g:projects[l:project_name] = {
                \ 'path': getcwd(),
                \ 'session': l:session_file,
                \ 'timestamp': strftime('%Y-%m-%d %H:%M:%S')
                \ }

    call writefile([json_encode(g:projects)], g:projects_json)
    echo 'Project saved:' l:project_name
endfunction

function! project#SwitchProject() abort
    let l:current = filter(items(g:projects), {_, v -> v[1].path == getcwd()})
    if !empty(l:current)
        call project#SaveProject()
    endif

    let l:project_list = ['Select a project:']
    let l:index = 0
    for [l:name, l:info] in items(g:projects)
        let l:index += 1
        call add(l:project_list, printf('%d. %s (%s)', l:index, l:name, l:info.path))
    endfor

    let l:choice = inputlist(l:project_list)
    if l:choice < 1 || l:choice > len(g:projects)
        echo 'No project selected.'
        return
    endif

    let l:project_name = keys(g:projects)[l:choice - 1]
    call project#LoadProject(l:project_name)
endfunction

function! project#LoadProject(name) abort
    let l:project = g:projects[a:name]

    silent! %bwipeout!
    silent! tabonly

    if filereadable(l:project.session)
        execute 'source' l:project.session
        execute 'lcd' l:project.path
        echo 'Project loaded:' a:name
    else
        echoerr 'Session file missing!'
    endif
endfunction

function! project#AutoSaveSession() abort
    let l:current = filter(items(g:projects), {_, v -> v[1].path == getcwd()})
    if !empty(l:current)
        call project#SaveProject()
    endif
endfunction
