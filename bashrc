#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
PS1='[\u@\h \W]\$ '

export XIM_PROGRAM=fcitx
export INPUT_METHOD=fcitx
export XMODIFIERS=@im=fcitx
export QT_IM_MODULE=fcitx
export GTK_IM_MODULE=fcitx
export XIM=fcitx
export EDITOR=/usr/bin/vim

# show git branch and repository name
function parse_git_dirty {
	[[ $(git status 2>/dev/null | tail -n1) != "nothing to commit, working tree clean" ]] && echo "*"
}
function parse_git_branch {
	git branch --no-color 2>/dev/null | sed -e '/^[^*]/d' -e "s/* \(.*\)/\1$(parse_git_dirty)/"
}

function parse_git_repo_name {
	ret=$(git remote -v 2>/dev/null | grep origin) && info=${ret##*/} && info=${info%% (*} && echo "$info"
}

function parse_git {
	if [ ! -n "$(parse_git_repo_name)" ]; then
		echo ""
	else
		echo "($(parse_git_repo_name)ᚬ$(parse_git_branch))"
	fi
}

export PS1='\[\033[01;32m\][\u@\h\[\033[01;37m\] \W\[\033[01;32m\]$(parse_git)]\$\[\033[00m\] '
# copy current path to clip
alias ccp='pwd | awk '\''{printf $0}'\'' | xclip -sel clip'

# to clip; exp: ls | toclip; auto remove '\n'
alias toclip='awk '\''{printf $0}'\'' | xclip -sel clip'

# proxy on/off
function proxy_on() {
	export http_proxy=127.0.0.1:12333
	export https_proxy=127.0.0.1:12333
}

function proxy_off() {
	unset http_proxy
	unset https_proxy
}

function pre_proxy() {
	export http_proxy=127.0.0.1:12333
	export https_proxy=127.0.0.1:12333
	$@
	unset http_proxy
	unset https_proxy
}

alias proxyon='proxy_on'
alias proxyoff='proxy_off'
alias preproxy='pre_proxy'
alias proxytest='preproxy curl cip.cc'

# Safe rm
#alias rm='echo "rm is dangerous, use trash-put instead."; rm -i'
#alias rm='bash /home/shacon/Workspace/bin/safe_rm/safe_rm.sh'

# undistract-me
export IGNORE_WINDOW_CHECK=1
export LONG_RUNNING_COMMAND_TIMEOUT=60
source /etc/profile.d/undistract-me.sh
#source /usr/share/undistract-me/long-running.bash
#notify_when_long_running_commands_finish_install

# history command
export HISTTIMEFORMAT="%Y/%m/%d %T "
export HISTSIZE=10000
export HISTFILESIZE=10000

# safe rm
# If the last character of the alias value is a blank, then the next command word following the alias is also checked for alias expansion.
alias sudo='sudo '
alias trash-put='bash /home/shacon/Software/bin/safe_rm/move_to_trash.sh'
alias rm='bash /home/shacon/Software/bin/safe_rm/safe_rm.sh'

# copy current path to clip
alias ccp='pwd | awk '\''{printf $0}'\'' | xclip -sel clip'

# to clip; exp: ls | toclip; auto remove '\n'
alias toclip='awk '\''{printf $0}'\'' | xclip -sel clip'

# Get file/folder full path
function ls_pwd() {
	ls -1 $1 | awk '{print i$0}' i=$(pwd)'/'
}

alias lsp='ls_pwd'

# Gen passwd
function gen_passwd() {
	echo "This is a simple password generator"
	for p in $(seq 1 5); do
		openssl rand -base64 48 | cut -c1-$1
	done
}

# 自定义cheats路径
export NAVI_PATH="/home/shacon/Workspace/docs/cheats"
eval "$(navi widget bash)"

# 从.env文件中导入环境变量
function myenvs() {
	if [ -z "$1" ]; then
		echo "Usage: myenvs [import file path]"
	else
		if [ -f "$1" ]; then
			source "$1" 2>/dev/null
			export $(cat "$1" | grep "=" | grep -v "^#" | awk /./ | cut -d= -f1 | xargs)
		else
			echo "Bad file path: $1"
		fi
	fi
}

# wine
export WINEARCH=win64
alias reboot='wineserver -k && reboot '
alias shutdown='wineserver -k && shutdown '

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/miniconda3/bin/conda' 'shell.bash' 'hook' 2>/dev/null)"
if [ $? -eq 0 ]; then
	eval "$__conda_setup"
else
	if [ -f "/opt/miniconda3/etc/profile.d/conda.sh" ]; then
		. "/opt/miniconda3/etc/profile.d/conda.sh"
	else
		export PATH="/opt/miniconda3/bin:$PATH"
	fi
fi
unset __conda_setup
# <<< conda initialize <<<

# nvm
source /usr/share/nvm/init-nvm.sh

# for gdb
ulimit -c 409600

export PATH="/opt/platforms/x64/rootfs/bin:$PATH"

export ELECTRON_OZONE_PLATFORM_HINT=auto
# how to use
# cat arch.bashrc > ~/.bashrc

