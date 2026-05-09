const LOYALSOLDIER_CLASH_RULE_BASE_URL = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/';

const PROXY_POLICY = 'PROXY';

export const LOYALSOLDIER_CLASH_RULE_PROVIDERS = [
	{ name: 'reject', behavior: 'domain' },
	{ name: 'icloud', behavior: 'domain' },
	{ name: 'apple', behavior: 'domain' },
	{ name: 'google', behavior: 'domain' },
	{ name: 'proxy', behavior: 'domain' },
	{ name: 'direct', behavior: 'domain' },
	{ name: 'private', behavior: 'domain' },
	{ name: 'gfw', behavior: 'domain' },
	{ name: 'greatfire', behavior: 'domain' },
	{ name: 'tld-not-cn', behavior: 'domain' },
	{ name: 'telegramcidr', behavior: 'ipcidr' },
	{ name: 'cncidr', behavior: 'ipcidr' },
	{ name: 'lancidr', behavior: 'ipcidr' },
	{ name: 'applications', behavior: 'classical' }
];

const LOYALSOLDIER_CLASH_RULES = [
	{ type: 'RULE-SET', provider: 'applications', policy: 'DIRECT' },
	{ type: 'DOMAIN', value: 'clash.razord.top', policy: 'DIRECT' },
	{ type: 'DOMAIN', value: 'yacd.haishan.me', policy: 'DIRECT' },
	{ type: 'RULE-SET', provider: 'private', policy: 'DIRECT' },
	{ type: 'RULE-SET', provider: 'reject', policy: 'REJECT' },
	{ type: 'RULE-SET', provider: 'icloud', policy: 'DIRECT' },
	{ type: 'RULE-SET', provider: 'apple', policy: 'DIRECT' },
	{ type: 'RULE-SET', provider: 'google', policy: PROXY_POLICY },
	{ type: 'RULE-SET', provider: 'proxy', policy: PROXY_POLICY },
	{ type: 'RULE-SET', provider: 'direct', policy: 'DIRECT' },
	{ type: 'RULE-SET', provider: 'lancidr', policy: 'DIRECT' },
	{ type: 'RULE-SET', provider: 'cncidr', policy: 'DIRECT' },
	{ type: 'RULE-SET', provider: 'telegramcidr', policy: PROXY_POLICY },
	{ type: 'GEOIP', value: 'LAN', policy: 'DIRECT' },
	{ type: 'GEOIP', value: 'CN', policy: 'DIRECT' },
	{ type: 'MATCH', policy: PROXY_POLICY }
];

export function generateLoyalsoldierClashRuleProviders() {
	return LOYALSOLDIER_CLASH_RULE_PROVIDERS.reduce((providers, rule) => {
		providers[rule.name] = {
			type: 'http',
			behavior: rule.behavior,
			url: `${LOYALSOLDIER_CLASH_RULE_BASE_URL}${rule.name}.txt`,
			path: `./ruleset/${rule.name}.yaml`,
			interval: 86400
		};
		return providers;
	}, {});
}

export function generateLoyalsoldierClashRules(proxyPolicy) {
	return LOYALSOLDIER_CLASH_RULES.map(rule => {
		const policy = rule.policy === PROXY_POLICY ? proxyPolicy : rule.policy;
		if (rule.type === 'RULE-SET') {
			return `RULE-SET,${rule.provider},${policy}`;
		}
		if (rule.type === 'DOMAIN' || rule.type === 'GEOIP') {
			return `${rule.type},${rule.value},${policy}`;
		}
		return `MATCH,${policy}`;
	});
}
