current_dir=${PWD}
rm -rf .bak
mkdir .bak
# ags
mv ~/.config/ags .bak
ln -s ${current_dir}/config/ags ~/.config/ags

# hypr
mv ~/.config/hypr .bak
ln -s ${current_dir}/config/hypr ~/.config/hypr

# alacritty
mv ~/.config/alacritty .bak
ln -s ${current_dir}/config/alacritty ~/.config/alacritty

mv ~/.vimrc .bak
mv ~/.vimrc.pro .bak
ln -s ${current_dir}/vimrc ~/.vimrc
ln -s ${current_dir}/vimrc.pro ~/.vimrc.pro

mv ~/.tmux.conf .bak
ln -s ${current_dir}/tmux.conf ~/.tmux.conf

mv ~/.bashrc .bak
ln -s ${current_dir}/bashrc ~/.bashrc

ln -s ${current_dir}/config/thunar/ ~/.config/Thunar