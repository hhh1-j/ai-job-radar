import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    console.log("🚀 收到前端请求，文本长度:", text?.length);

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "请输入岗位描述" }, { status: 400 });
    }

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      console.error("❌ 未找到 API Key");
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    // 设置超时控制器（15 秒超时）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log("📡 正在调用智谱 API...");
      
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "glm-4-flash-250414",
          messages: [
            {
              role: "system",
              content: "你是一名资深 HR 专家。请分析以下岗位描述（JD），提取：1.核心技能要求 2.经验门槛 3.面试高频考点。用简洁的 Markdown 列表输出，总字数不超过 200 字。",
            },
            { role: "user", content: text },
          ],
          temperature: 0.7,
        }),
        signal: controller.signal, // 应用超时控制
      });

      clearTimeout(timeoutId); // 请求成功或失败后清除定时器

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ 智谱 API 返回错误:", response.status, errorData);
        return NextResponse.json(
          { error: `API 错误: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        throw new Error("AI 未返回内容");
      }

      console.log("✅ 分析成功，返回结果长度:", result.length);
      return NextResponse.json({ result });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("❌ 网络请求异常:", fetchError);
      return NextResponse.json(
        { error: "网络连接超时或异常，请重试" },
        { status: 504 }
      );
    }

  } catch (error: any) {
    console.error(" 内部服务错误:", error);
    return NextResponse.json({ error: "系统繁忙，请稍后重试" }, { status: 500 });
  }
}