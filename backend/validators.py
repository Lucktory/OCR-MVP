def _digits(s: str | None) -> str:
    if not s:
        return ""
    return "".join(c for c in s if c.isdigit())


def validate_cnpj(cnpj: str | None) -> bool:
    d = _digits(cnpj)
    if len(d) != 14 or len(set(d)) == 1:
        return False
    nums = [int(c) for c in d]
    w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    s1 = sum(nums[i] * w1[i] for i in range(12))
    d1 = 0 if s1 % 11 < 2 else 11 - (s1 % 11)
    if d1 != nums[12]:
        return False
    w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    s2 = sum(nums[i] * w2[i] for i in range(13))
    d2 = 0 if s2 % 11 < 2 else 11 - (s2 % 11)
    return d2 == nums[13]


def validate_cpf(cpf: str | None) -> bool:
    d = _digits(cpf)
    if len(d) != 11 or len(set(d)) == 1:
        return False
    nums = [int(c) for c in d]
    s1 = sum(nums[i] * (10 - i) for i in range(9))
    d1 = 0 if s1 % 11 < 2 else 11 - (s1 % 11)
    if d1 != nums[9]:
        return False
    s2 = sum(nums[i] * (11 - i) for i in range(10))
    d2 = 0 if s2 % 11 < 2 else 11 - (s2 % 11)
    return d2 == nums[10]


def validate_documento(doc: str | None) -> bool:
    d = _digits(doc)
    if len(d) == 14:
        return validate_cnpj(d)
    if len(d) == 11:
        return validate_cpf(d)
    return False


def validate_soma_itens(extracted: dict) -> bool:
    itens = extracted.get("itens") or []
    valor_total = extracted.get("valor_total")
    if not itens or valor_total is None:
        return True
    soma = 0.0
    for item in itens:
        qtd = item.get("quantidade") or 0
        unit = item.get("valor_unitario") or 0
        soma += qtd * unit
    return abs(soma - valor_total) < 0.05
