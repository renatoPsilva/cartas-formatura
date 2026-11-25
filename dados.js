/* ==========================================================================
   Cartões de Gratidão — dados dos cartões
   Script clássico: funciona em file:// e no GitHub Pages.
   Conteúdo de exemplo. Substitua nomes, textos e imagens pelos definitivos.
   ========================================================================== */

window.DADOS = [
  {
    slug: "homenageada-exemplo",
    nome: "Homenageada Exemplo",
    disciplina: "Desenvolvimento Web",
    acento: "azul",
    selo: "PE",
    paginas: [
      {
        tipo: "texto",
        titulo: "Para começar",
        paragrafos: [
          "Esta é uma carta de exemplo, escrita para mostrar como o cartão funciona. O texto real será escrito pela Turma Ginga, com as palavras que só vocês sabem dizer.",
          "Quando a versão final estiver pronta, esta página pode falar sobre o começo das aulas, sobre a primeira vez que alguém entendeu um conceito difícil ou sobre o jeito de explicar que fez diferença."
        ]
      },
      {
        tipo: "texto",
        titulo: "O que ficou",
        paragrafos: [
          "Ficaram as manhãs de aula, as perguntas que pareciam simples e as que abriam o resto do dia. Ficou também a sensação de que aprender era possível — e que valia a pena tentar de novo."
        ]
      },
      {
        tipo: "foto",
        titulo: "Alguns momentos",
        fotos: [
          {
            src: "assets/img/homenageados/homenageada-exemplo/foto-01.svg",
            alt: "Ilustração abstrata usada como espaço reservado para uma foto da Turma Ginga",
            legenda: "Espaço reservado para uma foto da Turma Ginga. Substitua esta imagem no editor."
          },
          {
            src: "assets/img/homenageados/homenageada-exemplo/foto-02.svg",
            alt: "Ilustração abstrata usada como espaço reservado para uma lembrança das aulas",
            legenda: "Outro espaço para uma lembrança das aulas. A legenda pode contar o contexto."
          }
        ]
      },
      {
        tipo: "recados",
        titulo: "Recados da Turma Ginga",
        recados: [
          {
            autor: "Aluno 01",
            texto: "Obrigado(a) por explicar de novo, sem pressa, quando a Turma Ginga toda já tinha desistido."
          },
          {
            autor: "Aluna 02",
            texto: "Vou lembrar das aulas quando olhar para o primeiro projeto que consegui terminar."
          },
          {
            autor: "Aluno 03",
            texto: "Obrigado(a) pelo incentivo nos dias em que parecia mais difícil continuar."
          },
          {
            autor: "Aluna 04",
            texto: "Levo daqui não só o conteúdo, mas o jeito de olhar para um problema."
          }
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "samir",
    nome: "Samir",
    disciplina: "Liderança & Gestão de Pessoas",
    acento: "verde",
    paginas: [
      {
        tipo: "texto",
        titulo: "Querido Samir",
        paragrafos: [
          "Durante os meses desta jornada na Alpha EdTech, aprendemos a admirar a engrenagem viva que faz o projeto acontecer. Enquanto os professores compartilhavam código, lógica e arquitetura, você era o alicerce silencioso que mantinha o chão firme sob nossos pés."
        ]
      },
      {
        tipo: "texto",
        titulo: "A ponte",
        paragrafos: [
          "Liderar operações em um ambiente de formação intenso é difícil; fazer isso com escuta, humor e cuidado é raro. Você nunca foi apenas um gestor de processos: foi a ponte entre alunos, professores e empresas, garantindo que nossas dúvidas fossem acolhidas e que nossos talentos fossem vistos como pessoas, não números."
        ]
      },
      {
        tipo: "texto",
        titulo: "O que fica",
        paragrafos: [
          "Obrigado pelas palavras nos corredores e nas telas, pelas noites de organização para que avaliações, mentorias e eventos acontecessem, e pela serenidade que nos lembrava de que todo obstáculo tinha solução."
        ]
      },
      {
        tipo: "texto",
        titulo: "O que levamos",
        paragrafos: [
          "Levamos daqui um modelo de gestão humanizada e a certeza de que cuidar também é fazer acontecer. Aonde quer que a nossa carreira nos leve, haverá para sempre um traço do seu cuidado viabilizando nossos sonhos. Obrigado por acreditar que nenhuma trajetória fica para trás."
        ]
      },
      {
        tipo: "foto",
        titulo: "Registros",
        fotos: [
          {
            src: "assets/img/homenageados/samir/foto-01.webp",
            alt: "Imagem ilustrativa gerada por IA: Samir segurando um troféu em celebração da Alpha EdTech.",
            legenda: "Samir celebra com o troféu da Alpha EdTech."
          },
          {
            src: "assets/img/homenageados/samir/foto-02.webp",
            alt: "Imagem ilustrativa gerada por IA: Samir e a turma reunida no terraço, com bandeiras da Alpha EdTech.",
            legenda: "A turma reunida no terraço, com as bandeiras da Alpha EdTech."
          },
          {
            src: "assets/img/homenageados/samir/foto-03.webp",
            alt: "Imagem ilustrativa gerada por IA: Samir com a equipe e parceiros no Espaço Avibras Inovação.",
            legenda: "Samir com a equipe e os parceiros no Espaço Avibras Inovação."
          }
        ]
      },
      {
        tipo: "citacao",
        texto: "Liderança não é sobre estar no comando; é sobre cuidar daqueles que estão sob seus cuidados e abrir caminhos onde antes só havia barreiras.",
        autor: "Síntese da presença de Samir na Alpha EdTech"
      },
      {
        tipo: "assinatura",
        texto: "Com admiração, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "homenageado-01",
    nome: "Homenageado 01",
    disciplina: "Lógica de Programação",
    acento: "verde",
    selo: "P1",
    paginas: [
      {
        tipo: "texto",
        titulo: "Uma carta para você",
        paragrafos: [
          "Esta é uma carta de exemplo para o Homenageado 01. O texto final será escrito pela Turma Ginga e pode falar sobre as aulas, as conversas e as pequenas descobertas que ficaram deste período.",
          "Use este espaço para lembrar uma cena específica, uma explicação que abriu caminho ou uma qualidade que fez diferença no dia a dia da Turma Ginga."
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "homenageado-02",
    nome: "Homenageado 02",
    disciplina: "Banco de Dados",
    acento: "ameixa",
    selo: "P2",
    paginas: [
      {
        tipo: "texto",
        titulo: "Uma carta para você",
        paragrafos: [
          "Esta é uma carta de exemplo para o Homenageado 02. O texto final será escrito pela Turma Ginga e pode falar sobre as aulas, as conversas e as pequenas descobertas que ficaram deste período.",
          "Use este espaço para lembrar uma cena específica, uma explicação que abriu caminho ou uma qualidade que fez diferença no dia a dia da Turma Ginga."
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "homenageado-03",
    nome: "Homenageado 03",
    disciplina: "Desenvolvimento Front-end",
    acento: "ocre",
    selo: "P3",
    paginas: [
      {
        tipo: "texto",
        titulo: "Uma carta para você",
        paragrafos: [
          "Esta é uma carta de exemplo para o Homenageado 03. O texto final será escrito pela Turma Ginga e pode falar sobre as aulas, as conversas e as pequenas descobertas que ficaram deste período.",
          "Use este espaço para lembrar uma cena específica, uma explicação que abriu caminho ou uma qualidade que fez diferença no dia a dia da Turma Ginga."
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "homenageado-04",
    nome: "Homenageado 04",
    disciplina: "Desenvolvimento Back-end",
    acento: "seal",
    selo: "P4",
    paginas: [
      {
        tipo: "texto",
        titulo: "Uma carta para você",
        paragrafos: [
          "Esta é uma carta de exemplo para o Homenageado 04. O texto final será escrito pela Turma Ginga e pode falar sobre as aulas, as conversas e as pequenas descobertas que ficaram deste período.",
          "Use este espaço para lembrar uma cena específica, uma explicação que abriu caminho ou uma qualidade que fez diferença no dia a dia da Turma Ginga."
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "homenageado-05",
    nome: "Homenageado 05",
    disciplina: "Design de Interfaces",
    acento: "azul",
    selo: "P5",
    paginas: [
      {
        tipo: "texto",
        titulo: "Uma carta para você",
        paragrafos: [
          "Esta é uma carta de exemplo para o Homenageado 05. O texto final será escrito pela Turma Ginga e pode falar sobre as aulas, as conversas e as pequenas descobertas que ficaram deste período.",
          "Use este espaço para lembrar uma cena específica, uma explicação que abriu caminho ou uma qualidade que fez diferença no dia a dia da Turma Ginga."
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "homenageado-06",
    nome: "Homenageado 06",
    disciplina: "Infraestrutura",
    acento: "verde",
    selo: "P6",
    paginas: [
      {
        tipo: "texto",
        titulo: "Uma carta para você",
        paragrafos: [
          "Esta é uma carta de exemplo para o Homenageado 06. O texto final será escrito pela Turma Ginga e pode falar sobre as aulas, as conversas e as pequenas descobertas que ficaram deste período.",
          "Use este espaço para lembrar uma cena específica, uma explicação que abriu caminho ou uma qualidade que fez diferença no dia a dia da Turma Ginga."
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  },
  {
    slug: "homenageado-07",
    nome: "Homenageado 07",
    disciplina: "Segurança da Informação",
    acento: "ameixa",
    selo: "P7",
    paginas: [
      {
        tipo: "texto",
        titulo: "Uma carta para você",
        paragrafos: [
          "Esta é uma carta de exemplo para o Homenageado 07. O texto final será escrito pela Turma Ginga e pode falar sobre as aulas, as conversas e as pequenas descobertas que ficaram deste período.",
          "Use este espaço para lembrar uma cena específica, uma explicação que abriu caminho ou uma qualidade que fez diferença no dia a dia da Turma Ginga."
        ]
      },
      {
        tipo: "assinatura",
        texto: "Com carinho, Turma Ginga",
        ano: "2026"
      }
    ]
  }
];
