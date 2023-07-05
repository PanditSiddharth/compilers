{ pkgs }: {
    deps = [
        pkgs.python3Full
        pkgs.nano
        pkgs.vim
        pkgs.python39Packages.pip
        pkgs.toybox
        pkgs.dotnet-sdk_5
        pkgs.nixos-rebuild
        pkgs.lsof
        pkgs.jdk
        pkgs.mono5
        pkgs.go
        pkgs.gcc
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodejs
        pkgs.nodePackages.typescript
        pkgs.nodePackages.typescript-language-server
    ];
}