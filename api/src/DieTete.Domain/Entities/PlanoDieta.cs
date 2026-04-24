using DieTete.Domain.Common;
using DieTete.Domain.Enums;

namespace DieTete.Domain.Entities;

public class PlanoDieta : Entity
{
    public Guid UsuarioId { get; private set; }
    public string NomeArquivoOriginal { get; private set; } = default!;
    public string CaminhoArquivo { get; private set; } = default!;
    public StatusPlanoDieta Status { get; private set; }
    public string? MensagemErro { get; private set; }
    public DateTime? ProcessadoEm { get; private set; }
    private readonly List<DiaDieta> _dias = [];
    public IReadOnlyList<DiaDieta> Dias => _dias.AsReadOnly();

    private PlanoDieta() { }

    public static PlanoDieta Criar(Guid usuarioId, string nomeArquivoOriginal, string caminhoArquivo) =>
        new()
        {
            UsuarioId = usuarioId,
            NomeArquivoOriginal = nomeArquivoOriginal,
            CaminhoArquivo = caminhoArquivo,
            Status = StatusPlanoDieta.Pendente
        };

    public void MarcarComoProcessado()
    {
        Status = StatusPlanoDieta.Processado;
        ProcessadoEm = DateTime.UtcNow;
        SetUpdated();
    }

    public void MarcarComoFalhou(string mensagem)
    {
        Status = StatusPlanoDieta.Falhou;
        MensagemErro = mensagem;
        SetUpdated();
    }

    public void AdicionarDia(DiaDieta dia) => _dias.Add(dia);
}
