{pkgs}: {
  deps = [
    pkgs.glibcLocales
    pkgs.bash
    pkgs.rustc
    pkgs.libiconv
    pkgs.cargo
    pkgs.libxcrypt
  ];
}
