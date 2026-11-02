import math, os, urllib.request, time
def t(lat, lon, z):
    n = 2 ** z
    return (int((lon + 180) / 360 * n), int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n))
LAT0, LAT1, LON0, LON1 = 13.7930, 13.7310, 100.4640, 100.5300
for z in (16,):
    x0, y0 = t(LAT0, LON0, z); x1, y1 = t(LAT1, LON1, z)
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            p = f"tiles/{z}/{x}/{y}.jpg"
            os.makedirs(os.path.dirname(p), exist_ok=True)
            url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            for i in range(3):
                try:
                    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                    open(p, "wb").write(urllib.request.urlopen(req, timeout=30).read()); break
                except Exception as e:
                    print("retry", url, e); time.sleep(2)
print("done")
