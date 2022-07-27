from multiprocessing.connection import wait
from fastapi import FastAPI
import re
import os
from glob import glob
import pathlib
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

ModRootDir = "~/Documents/Paradox Interactive/Crusader Kings III/mod"
# TODO: change mod id, from test to real mod
# MLPModDesc = os.path.expanduser(ModRootDir + "/ugc_2802753831.mod")
MLPModDescPath = os.path.expanduser(ModRootDir + "/ugc_2838210519.mod")


# Read Mod description file and return mod path, name
def loadModPathName(ModDescFile):
    with open(
        ModDescFile,
        encoding="utf-8",
    ) as f:
        ModPath = None
        ModName = None
        for l in f.readlines():
            if "path=" in l:
                ModPath = re.split(r"(path=)", l.strip(), maxsplit=1)[-1].replace(
                    '"', ""
                )

            if "name=" in l:
                ModName = (
                    re.split(r"(name=)", l.strip(), maxsplit=1)[-1]
                    .replace('"', "")
                    .strip()
                )

    return ModPath, ModName


# Check MLP Mod dir is exists, if not return false and site show warning
@app.get("/check-container-mod")
async def checkContainerMod():
    if not os.path.exists(MLPModDescPath):
        return False
    else:
        return True


# Copy Main lang to another lang, Return error message if have
@app.get("/translate-language/{MainLang}/{TargetLang}")
def translateLanguage(MainLang: str, TargetLang: str):

    # List all Mod description file
    ModDiscFiles = glob(
        os.path.join(
            os.path.expanduser(ModRootDir),
            r"*.mod",
        ),
    )

    # List all (Mod Path, Mod Name) pairs
    ModList = []
    for ModDiscFile in ModDiscFiles:
        with open(ModDiscFile, encoding="utf-8") as f:
            ModPath = None
            ModName = None
            for l in f.readlines():
                if "path=" in l:
                    ModPath = re.split(r"(path=)", l.strip(), maxsplit=1)[-1].replace(
                        '"', ""
                    )

                if "name=" in l:
                    ModName = (
                        re.split(r"(name=)", l.strip(), maxsplit=1)[-1]
                        .replace('"', "")
                        .strip()
                    )

            ModList.append((ModPath, ModName))

    # Lis all Mods
    for ModPath, ModName in ModList:
        print(ModPath, ModName)
        LocalPath = os.path.join(ModPath, "localization")
        try:
            ModID = os.path.basename(os.path.split(os.path.normpath(LocalPath))[0])
            MainLocalizationFiles = glob(
                os.path.join(LocalPath, r"**", r"*l_" + MainLang + ".yml"),
                recursive=True,
            )

            # Lis all Localization files in this Mod
            for MainLangFilename in MainLocalizationFiles:

                # Parse localization sentense, cause there is custom format, can't use csv lib
                MainLangStringList = {}
                with open(MainLangFilename, encoding="utf-8-sig") as File:
                    # print(MainLangFilename)
                    next(File)
                    for k, l in enumerate(File):

                        # empty line
                        if len(l.strip()) == 0:
                            continue

                        # comment
                        if l.strip()[0] == "#":
                            continue

                        # parse localization sentense, $KEY:$Sep => $VAL
                        try:
                            Key, Sep, Val = re.split(r"(:\d*)", l.strip(), maxsplit=1)
                            MainLangStringList[Key.strip() + Sep.strip()] = Val.strip()
                            # print((Key, Sep, Val))
                        except:
                            print(MainLangFilename)
                            print("ERROR: ", k, l)
                            continue

                # Create new target lang file in container mod dir
                TargetLangBasename = os.path.basename(MainLangFilename).replace(
                    "l_" + MainLang + ".yml", "l_" + TargetLang + ".yml"
                )

                OriTargetLangDirname = os.path.dirname(MainLangFilename).replace(
                    MainLang, TargetLang
                )

                OriTargetLangFilename = os.path.join(
                    OriTargetLangDirname, TargetLangBasename
                )

                MLPTargetDirname = os.path.join(
                    loadModPathName(MLPModDescPath)[0],
                    "localization",
                    TargetLang,
                    "".join([c for c in ModName if re.match(r"\w", c)]),
                )

                MLPTargetFilename = os.path.join(MLPTargetDirname, TargetLangBasename)

                # check original localization file is exist or not
                if not os.path.exists(OriTargetLangFilename):
                    # Copy all localization file to MLP Mod
                    pathlib.Path(MLPTargetDirname).mkdir(parents=True, exist_ok=True)
                    with open(MLPTargetFilename, "w", encoding="utf-8-sig") as File:
                        File.write("l_" + TargetLang + ":\n")
                        for StringKey, StringValue in MainLangStringList.items():
                            File.write(f" {StringKey} {StringValue}\n")
                else:
                    # Copy untranslate sentence to MLP Mod
                    TargetLangStringList = dict(MainLangStringList)
                    with open(MLPTargetDirname, encoding="utf-8-sig") as File:
                        # skip first line
                        next(File)
                        for k, l in enumerate(File):
                            if len(l.strip()) == 0:
                                continue

                            if l.strip()[0] == "#":
                                continue

                            try:
                                Key, Sep, Val = re.split(
                                    r"(:\d*)", l.strip(), maxsplit=1
                                )
                                StringKey = Key.strip() + Sep.strip()

                                TargetLangStringList.pop(StringKey, None)
                            except:
                                # if parse fail, print error msg and skip
                                # TODO: add to error message
                                print(MLPTargetDirname)
                                print("ERROR: ", k, l)
                                continue

                    # if all sentence in translation, skip to next file
                    if len(TargetLangStringList) == 0:
                        continue

                    # write untranslate sentence to MLP Mod localization
                    pathlib.Path(MLPTargetDirname).mkdir(parents=True, exist_ok=True)
                    with open(MLPTargetFilename, "w", encoding="utf-8-sig") as File:
                        File.write("l_" + TargetLang + ":\n")
                        for StringKey, StringValue in TargetLangStringList.items():
                            File.write(f" {StringKey} {StringValue}\n")
        except:
            # if any unexpect error, just for debug
            return "Unkown Error"

    return None


if __name__ == "__main__":
    # Run API server
    uvicorn.run(app, host="localhost", port=8888)
