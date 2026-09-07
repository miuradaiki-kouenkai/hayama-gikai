import { LinkButton } from "./link-button";

export function TeamMirai() {
  return (
    <div className="py-10">
      <div className="flex flex-col gap-6">
        {/* ヘッダー */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-primary-accent">運営について</p>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-[28px] text-black">
              みらい議会＠葉山町は、葉山町の町政をわかりやすく伝えるために運営されている非公式の取り組みです。これは政党チームみらいが運営しているものではありません。本家「みらい議会」の仕組みを活用し、葉山町議会の議案や意見を届けることを目指しています。
            </p>
          </div>

          {/* ボタングループ */}
          <div className="flex flex-col gap-4">
            <LinkButton
              href="https://gikai.team-mir.ai/"
              icon={{
                src: "/icons/info-icon.svg",
                alt: "",
                width: 23,
                height: 22,
              }}
            >
              本家「みらい議会」を見る
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
