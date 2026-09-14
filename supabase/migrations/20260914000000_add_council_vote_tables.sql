-- 葉山町議会の議員別賛否・討論データを格納するテーブル
-- データ源: 町サイトの議員別賛否PDF（○=賛成/×=反対/討論=討論参加/－=議長で表決権なし）
-- および議会中継の会議録（討論の発言・起立採決の人数）

CREATE TABLE council_members (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    seat_number INT,
    party TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE council_members IS '葉山町議会議員の名簿（議席順）。町サイト「議員の紹介」より';
COMMENT ON COLUMN council_members.seat_number IS '議席番号（1〜14）。議長も議席番号を持つ';
COMMENT ON COLUMN council_members.role IS 'member: 一般議員, chair: 議長（表決権なし。可否同数のときのみ裁決）';

CREATE TABLE bill_votes (
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    council_member_id UUID NOT NULL REFERENCES council_members(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('for', 'against', 'proposer', 'non_voting')),
    debated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (bill_id, council_member_id)
);

COMMENT ON TABLE bill_votes IS '議案ごとの議員別賛否。議員別賛否PDFの○×を転記';
COMMENT ON COLUMN bill_votes.vote IS 'for: 賛成(○), against: 反対(×), proposer: 提出者(◎), non_voting: 表決権なし(議長=−)';
COMMENT ON COLUMN bill_votes.debated IS '討論に参加したか（PDFの「討論」マーク）';

CREATE TABLE bill_debates (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    council_member_id UUID REFERENCES council_members(id) ON DELETE SET NULL,
    speaker_name TEXT NOT NULL,
    stance TEXT NOT NULL CHECK (stance IN ('for', 'against')),
    content TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bill_debates IS '本会議の賛否討論の発言抜粋。会議録より「〜の立場から討論に参加」発言を抽出';
COMMENT ON COLUMN bill_debates.stance IS 'for: 賛成討論, against: 反対討論';

CREATE INDEX idx_bill_votes_bill_id ON bill_votes(bill_id);
CREATE INDEX idx_bill_votes_member_id ON bill_votes(council_member_id);
CREATE INDEX idx_bill_debates_bill_id ON bill_debates(bill_id);
CREATE INDEX idx_bill_debates_member_id ON bill_debates(council_member_id);
CREATE INDEX idx_council_members_seat_number ON council_members(seat_number);

ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_debates ENABLE ROW LEVEL SECURITY;
