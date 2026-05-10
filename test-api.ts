import fetch from 'node-fetch';

async function test() {
    const key = "sk-YZjmB_SuF7khId64RojYIaiZ6QxLdTmF";
    
    // WITHOUT Bearer
    try {
        const res1 = await fetch("https://routerai.ru/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": key,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "google/gemini-3.1-pro-preview",
              messages: [{"role": "user", "content": "Hello"}]
            })
        });
        console.log("No Bearer status:", res1.status);
        console.log("No Bearer payload:", await res1.text());
    } catch (e: any) {
        console.log("No Bearer error:", e.message);
    }
    
    // WITH Bearer
    try {
        const res2 = await fetch("https://routerai.ru/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + key,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "google/gemini-3.1-pro-preview",
              messages: [{"role": "user", "content": "Hello"}]
            })
        });
        console.log("With Bearer status:", res2.status);
        console.log("With Bearer payload:", await res2.text());
    } catch (e: any) {
        console.log("With Bearer error:", e.message);
    }
}
test();
