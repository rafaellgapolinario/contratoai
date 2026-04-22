// Gera o bloco de contexto de data/recencia injetado em todos os prompts
// juridicos do ContratoAI. Garante que a IA saiba em que ano esta operando
// e priorize material atualizado (cascata: ano corrente → anos anteriores).

export function getDateContext(): { ano: number; bloco: string } {
  const ano = new Date().getFullYear()
  const anoAnt = ano - 1
  const bloco = `CONTEXTO TEMPORAL (obrigatorio observar):
- Hoje estamos em ${ano}.
- Priorize SEMPRE legislacao, jurisprudencia e sumulas VIGENTES EM ${ano}.
- Se nao houver material de ${ano} para o tema, use o mais recente possivel (${anoAnt}, depois ${anoAnt - 1}, e assim por diante em ordem decrescente).
- NAO cite leis, artigos ou sumulas revogadas/superadas sem sinalizar expressamente "revogada" ou "superada".
- Ao citar jurisprudencia, prefira decisoes dos ultimos 3 anos (${anoAnt - 1}-${ano}) — so use decisoes mais antigas se forem lideres ou se nao houver precedente recente.
- Ao citar dispositivos legais, use as redacoes atualmente em vigor (pos ultimas reformas: reforma tributaria, reforma trabalhista, novo CPC, LGPD, etc.).`
  return { ano, bloco }
}
