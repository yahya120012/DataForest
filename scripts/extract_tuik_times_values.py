import re
import json
import pathlib
import sys


def extract_times_values(xml_text: str):
    # XML metni içinde TUİK'in tek satır minify çıktısı olduğu için
    # sadece XML başlangıcından itibaren parse ediyoruz.
    idx = xml_text.find("<?xml")
    if idx != -1:
        xml_text = xml_text[idx:]

    unit_m = re.search(r'<generic:Value id="UNIT_MEASURE" value="(.*?)"\s*/>', xml_text)
    unit = unit_m.group(1) if unit_m else None

    obs_re = re.compile(r"<generic:Obs>(.*?)</generic:Obs>", re.S)
    time_re = re.compile(r'<generic:ObsDimension id="TIME_PERIOD" value="(.*?)"\s*/>')
    val_re = re.compile(r'<generic:ObsValue value="(.*?)"\s*/>')

    totals = {}
    for obs in obs_re.findall(xml_text):
        tm = time_re.search(obs)
        vm = val_re.search(obs)
        if not tm or not vm:
            continue
        t = tm.group(1)
        try:
            v = float(vm.group(1))
        except Exception:
            continue
        totals[t] = totals.get(t, 0.0) + v

    times = sorted(totals.keys(), key=lambda x: float(x))
    values = [totals[t] for t in times]
    return unit, times, values


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python extract_tuik_times_values.py ALL-0.md")

    fn = sys.argv[1]
    base = pathlib.Path(__file__).resolve().parents[1] / "data" / "tuik"
    xml_text = (base / fn).read_text(encoding="utf-8", errors="ignore")

    unit, times, values = extract_times_values(xml_text)
    print(json.dumps({"file": fn, "unit": unit, "times": times, "values": values}, ensure_ascii=False))


if __name__ == "__main__":
    main()

