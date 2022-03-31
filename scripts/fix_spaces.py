import os
from pathlib import Path

EXT = set(['.jpg', '.gif', '.png'])

def main():
    for root, dirs, files in os.walk('./modules/'):
        # print(f'{root} {dirs} {files}')
        for f in files:
            if ' ' in f and os.path.splitext(f)[1] in EXT:
                path = Path(root) / f
                new_path = Path(root) / f.replace(' ', '_')
                print(f'{path} => {new_path}')
                os.rename(path, new_path)


    pass

if __name__ == "__main__":
    main()