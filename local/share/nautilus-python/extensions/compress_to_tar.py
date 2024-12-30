import os

from gi.repository import GObject, Nautilus


class CompressToTar(GObject.GObject, Nautilus.MenuProvider):
    def __init__(self):
        super().__init__()

    def menu_activate_cb(self, menu, files):
        for file in files:
            filepath = file.get_location().get_path()
            dirname = os.path.dirname(filepath)
            basename = os.path.basename(filepath)
            tar_name = f"{dirname}/{basename}.tar"
            os.system(f"tar -cf {tar_name} -C {dirname} {basename}")

    def get_file_items(self, *args):
        files = args[-1]
        if len(files) != 1:
            return []

        item = Nautilus.MenuItem(
            name="CompressToTar::Compress",
            label="Compress to TAR",
            tip="Compress the selected file or folder to .tar",
        )
        item.connect("activate", self.menu_activate_cb, files)
        return [item]
