#!/usr/bin/python3.5
import os
import zipfile
import json
import datetime
import sys

def increaseVersion(version):
    now = datetime.datetime.now()
    test = version.split(".")
    dateNow = str(now.year) + "." + str(now.month) + "." + str(now.day)
    if(test[0] + "." + test[1] + "." + test[2] != dateNow):
        version = dateNow + ".1"
    else:
        test[len(test)-1] = str(int(test[len(test)-1]) + 1)
        version = ""
        for i in range(0,len(test)):
            if i not in [0,len(test)] :
                version += "."
            version += test[i]
    print("Update to version : " + version)
    return version

def makeZip(sys):
    if "-o" in sys.argv:
        archiveName = sys.argv[sys.argv.index("-o") + 1]
    else:
        archiveName = "O2GExtension.zip"
    with open("manifest.json","r") as f: 
        data = json.load(f)
        data['version'] = increaseVersion(data['version'])
    with open("manifest.json","w") as f:
        json.dump(data, f, indent=4)
    zipf = zipfile.ZipFile(archiveName, 'w', zipfile.ZIP_DEFLATED)
    zipdir('.', zipf)
    zipf.close()

def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        if '.git' not in root:
            for file in files:
                if "zip" not in file and "py" not in file:
                    ziph.write(os.path.join(root, file))

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] in ["-v", "--version", "version"]:
            with open("manifest.json","r") as f:
                data = json.load(f)
                print(data['version'])
        elif sys.argv[1] in ["-h", "--help", "help"]:
            print("Command line options :")
            print("-h                : help")
            print("-v                : get version")
            print("-o [archive name] : change archive name")
        else:
            makeZip(sys)
    else:
        makeZip(sys)

