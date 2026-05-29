import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  CityId,
  Member,
  MemberOverride,
  Party,
  ParliamentaryGroup,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

interface SourcesFile {
  cities: Array<{
    id: CityId;
    name: string;
    councilName: string;
    approxMemberCount: number;
    sources: Record<string, string>;
    majorKaihaSeen: string[];
  }>;
}

interface OverridesFile {
  overrides: MemberOverride[];
}

let _parties: Party[] | null = null;
let _sources: SourcesFile | null = null;
let _overrides: OverridesFile | null = null;
const _membersByCityId = new Map<CityId, Member[]>();

async function readJson<T>(filename: string): Promise<T> {
  const content = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(content) as T;
}

export async function getParties(): Promise<Party[]> {
  if (!_parties) {
    _parties = await readJson<Party[]>("parties.json");
  }
  return _parties;
}

export async function getPartyMap(): Promise<Map<string, Party>> {
  const parties = await getParties();
  return new Map(parties.map((p) => [p.id, p]));
}

export async function getSources(): Promise<SourcesFile> {
  if (!_sources) {
    _sources = await readJson<SourcesFile>("sources.json");
  }
  return _sources;
}

export async function getCities() {
  const sources = await getSources();
  return sources.cities;
}

export async function getCity(cityId: CityId) {
  const cities = await getCities();
  return cities.find((c) => c.id === cityId);
}

async function getOverrides(): Promise<OverridesFile> {
  if (!_overrides) {
    _overrides = await readJson<OverridesFile>("member-overrides.json");
  }
  return _overrides;
}

function applyOverrides(member: Member, overrides: MemberOverride[]): Member {
  const matching = overrides.find((o) => o.id === member.id);
  if (!matching) return member;
  return { ...member, ...matching.fields };
}

export async function getMembersByCity(cityId: CityId): Promise<Member[]> {
  if (_membersByCityId.has(cityId)) {
    return _membersByCityId.get(cityId)!;
  }
  const filePath = path.join(DATA_DIR, "members", `${cityId}.json`);
  let raw: Member[] = [];
  try {
    const content = await fs.readFile(filePath, "utf-8");
    raw = JSON.parse(content) as Member[];
  } catch {
    raw = [];
  }
  const { overrides } = await getOverrides();
  const merged = raw.map((m) => applyOverrides(m, overrides));
  _membersByCityId.set(cityId, merged);
  return merged;
}

export async function getAllMembers(): Promise<Member[]> {
  const cities = await getCities();
  const lists = await Promise.all(
    cities.map((c) => getMembersByCity(c.id as CityId)),
  );
  return lists.flat();
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const all = await getAllMembers();
  return all.find((m) => m.id === id);
}

interface KaihaFile {
  groups: ParliamentaryGroup[];
}

export async function getParliamentaryGroups(
  cityId: CityId,
): Promise<ParliamentaryGroup[]> {
  const filePath = path.join(DATA_DIR, "kaiha", `${cityId}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as KaihaFile;
    return parsed.groups;
  } catch {
    return [];
  }
}
