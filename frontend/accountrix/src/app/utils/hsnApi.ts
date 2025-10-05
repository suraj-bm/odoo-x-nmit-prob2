// utils/hsnApi.ts
export async function fetchHSN(inputText: string, searchBy: "byCode" | "byDesc", category: "P" | "S" | "null") {
  const url = `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${encodeURIComponent(
    inputText
  )}&selectedType=${searchBy}&category=${category}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch HSN data");

    const data = await res.json();
    return data.data || []; // array of {c: code, n: name}
  } catch (err) {
    console.error(err);
    return [];
  }
}
