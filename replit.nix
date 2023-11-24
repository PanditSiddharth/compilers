{ pkgs }: {
    deps = [
        pkgs.python3Full
        pkgs.nano
        pkgs.nodejs-16_x
        pkgs.vim
        pkgs.python39Packages.pip
        pkgs.nixos-rebuild
        pkgs.lsof
        pkgs.jdk
        pkgs.mono5
        pkgs.go
        pkgs.gcc
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodePackages.typescript
        pkgs.nodePackages.typescript-language-server
    ];
}