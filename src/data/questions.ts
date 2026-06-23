import type { Question } from '../types';

// Perguntas objetivas (somente múltipla escolha) da "Revisão III - Avaliação
// de Conhecimentos" (Disciplina Gerência de Projetos de Software - UFSM).
// A questão 22 (discursiva, GQM) foi deixada de fora, conforme pedido.
//
// Gabarito oficial informado: 1B 2B 3E 4E 5A 6B 7D 8B 9B 10C 11A 12C 13D 14C
// 15D 16D 17A 18B 19D 20B 21C
//
// Observação: na questão 2, a leitura literal do enunciado (item II descreve
// a Sprint Review/Retrospective, não a Sprint Planning) sugeriria "III e IV"
// (alternativa C). Mantivemos a alternativa B por ser o gabarito oficial
// fornecido — vale confirmar com o professor se ficar em dúvida.

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'O princípio Ágil "Simplicidade - a arte de maximizar a quantidade de trabalho não realizado - é essencial" pode ser melhor traduzido em quais termos?',
    alternatives: [
      '"Qualidade é o que importa".',
      '"Evite o desperdício".',
      '"Trabalhe o mínimo possível".',
      '"Maximize o seu trabalho".',
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    text:
      'Considerando a metodologia Scrum, avalie as afirmações a seguir.\n' +
      'I. Durante a Sprint, tanto a composição do time quanto as metas de qualidade devem ser modificadas, já que o ScrumMaster efetua todas as mudanças necessárias para atingir a meta.\n' +
      'II. A reunião de planejamento da Sprint é o momento onde o ScrumMaster encoraja o time a revisar, dentro do modelo de trabalho e das práticas do Scrum, seu processo de desenvolvimento.\n' +
      'III. O Daily Scrum se caracteriza por uma reunião diária de 15 minutos, realizada para avaliação do que foi desenvolvido, dos impedimentos encontrados e do que será feito até a próxima reunião.\n' +
      'IV. O Product Owner é a pessoa responsável pelo Product Backlog, que serve muitas vezes de guia para a execução do projeto, por seu conteúdo, disponibilidade e priorização.\n' +
      'É correto apenas o que se afirma em:',
    alternatives: ['I e II.', 'II e III.', 'III e IV.', 'I, II e IV.', 'I, III e IV.'],
    correctIndex: 1,
  },
  {
    id: 3,
    text:
      'No planejamento de projetos de software, e principalmente em metodologias ágeis de desenvolvimento, muitos autores defendem a técnica conhecida como "timebox", que:',
    alternatives: [
      'estima o menor e o maior tempo de desenvolvimento para cada funcionalidade a ser desenvolvida, definindo uma "caixa" de tempo em vez de um prazo fixo.',
      'parte do tempo disponível em uma fábrica de software para especificar versões consecutivas de um produto, conhecidas como "caixas".',
      'divide um produto de software em versões de complexidade crescente, conhecidas como "caixas", especificando o tempo de desenvolvimento de cada caixa do mais rápido para o mais longo.',
      'define um tempo para cada função a ser desenvolvida e as aloca em "caixas" de igual tempo de desenvolvimento que são escolhidas pelos desenvolvedores.',
      'define o tempo a ser utilizado em um ciclo de desenvolvimento e depois define as funcionalidades que podem ser desenvolvidas naquela "caixa" de tempo.',
    ],
    correctIndex: 4,
  },
  {
    id: 4,
    text:
      'Sobre o Scrum Team, unidade fundamental da metodologia ágil Scrum, analise as assertivas abaixo, assinalando V, se verdadeiras, ou F, se falsas.\n' +
      '( ) Scrum Master é o responsável pelo gerenciamento eficaz do Product Backlog.\n' +
      '( ) Product Owner é uma pessoa e não um comitê.\n' +
      '( ) Developers são as pessoas do Scrum Team que estão comprometidas em criar um Incremento utilizável a cada Sprint.\n' +
      'A ordem correta de preenchimento dos parênteses, de cima para baixo, é:',
    alternatives: ['V – F – F.', 'V – V – F.', 'V – V – V.', 'F – F – V.', 'F – V – V.'],
    correctIndex: 4,
  },
  {
    id: 5,
    text: 'Qual é a diferença entre "Product Backlog" e "Sprint Backlog" em Scrum?',
    alternatives: [
      'O Product Backlog é uma lista de todas as funcionalidades desejadas para o produto, enquanto o Sprint Backlog é uma lista de tarefas a serem concluídas durante uma Sprint.',
      'O Product Backlog é gerenciado pelo Time de Desenvolvimento, enquanto o Sprint Backlog é gerenciado pelo Product Owner.',
      'O Sprint Backlog é uma lista de todas as funcionalidades desejadas para o produto, enquanto o Product Backlog é uma lista de tarefas a serem concluídas durante uma Sprint.',
      'O Product Backlog é atualizado diariamente, enquanto o Sprint Backlog é atualizado semanalmente.',
    ],
    correctIndex: 0,
  },
  {
    id: 6,
    text: 'O que é Kanban?',
    alternatives: [
      'Um framework para desenvolvimento ágil de software com papéis definidos e cerimônias.',
      'Um método de gestão visual que utiliza cartões para representar o trabalho e otimizar o fluxo de tarefas.',
      'Um conjunto de princípios para desenvolvimento de software extremo.',
      'Uma ferramenta de planejamento de projeto com fases sequenciais.',
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    text:
      'Em um projeto Scrum, um Time de Desenvolvimento está constantemente falhando em cumprir suas metas de Sprint. Qual ação o Scrum Master deve tomar para resolver esse problema?',
    alternatives: [
      'Aumentar o tamanho da Sprint para dar mais tempo ao Time de Desenvolvimento.',
      'Reduzir a quantidade de trabalho comprometida para cada Sprint.',
      'Reatribuir as tarefas do Sprint Backlog entre os membros do Time de Desenvolvimento.',
      'Realizar uma análise de causa raiz durante a Sprint Retrospective para identificar e resolver os obstáculos.',
    ],
    correctIndex: 3,
  },
  {
    id: 8,
    text:
      'Qual é a função do Product Owner na priorização do Product Backlog, e como essa atividade impacta o valor do produto entregue ao cliente?',
    alternatives: [
      'O Product Owner revisa o Product Backlog semanalmente para garantir que as tarefas mais difíceis sejam feitas primeiro.',
      'O Product Owner prioriza itens no Product Backlog com base no feedback do cliente e no valor de negócio, o que maximiza o valor entregue ao cliente em cada Sprint.',
      'O Product Owner delega a priorização do Product Backlog ao Scrum Master para garantir uma abordagem imparcial.',
      'O Product Owner prioriza o Product Backlog de acordo com a ordem de chegada das solicitações de funcionalidades.',
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    text:
      'Em Extreme Programming (XP), como a prática de "Integração Contínua" contribui para a detecção precoce de defeitos, e quais são os passos críticos para implementar essa prática com sucesso?',
    alternatives: [
      'A Integração Contínua permite que o código seja revisado por vários programadores antes de ser integrado, e os passos críticos incluem revisões de código e auditorias de segurança.',
      'A Integração Contínua envolve a fusão frequente de código em um repositório central, e os passos críticos incluem a automação dos testes, builds automatizados e commits frequentes.',
      'A Integração Contínua foca na implementação de novas funcionalidades antes de corrigir defeitos, e os passos críticos incluem planejamento detalhado e validação manual.',
      'A Integração Contínua depende da refatoração contínua do código, e os passos críticos incluem a revisão constante do design e arquitetura do software.',
    ],
    correctIndex: 1,
  },
  {
    id: 10,
    text:
      'Na prática de "Metáforas" em XP, como essa técnica facilita a comunicação dentro da equipe de desenvolvimento, e quais são as características essenciais de uma metáfora eficaz?',
    alternatives: [
      'As metáforas fornecem uma linguagem técnica comum para a equipe, e suas características essenciais incluem complexidade e detalhamento técnico.',
      'As metáforas permitem que a equipe use exemplos do mundo real para criar modelos de dados complexos, e suas características essenciais incluem precisão e detalhamento exaustivo.',
      'As metáforas ajudam a equipe a visualizar a arquitetura do sistema de forma simples e intuitiva, e suas características essenciais incluem simplicidade, clareza e relevância para o contexto do projeto.',
      'As metáforas substituem a documentação formal por histórias narrativas, e suas características essenciais incluem criatividade e liberdade interpretativa.',
    ],
    correctIndex: 2,
  },
  {
    id: 11,
    text:
      'Como a teoria das filas é aplicada no Kanban para otimizar o fluxo de trabalho e reduzir o tempo de ciclo, e quais são os principais conceitos dessa teoria que devem ser considerados?',
    alternatives: [
      'A teoria das filas ajuda a identificar gargalos no fluxo de trabalho, e os principais conceitos incluem a limitação do trabalho em progresso (WIP), a taxa de chegada e a taxa de atendimento.',
      'A teoria das filas é usada para calcular o tempo total de desenvolvimento de cada tarefa, e os principais conceitos incluem a previsão de prazos e a documentação detalhada das tarefas.',
      'A teoria das filas é aplicada para determinar a sequência exata de tarefas a serem realizadas, e os principais conceitos incluem a priorização de tarefas e a alocação de recursos.',
      'A teoria das filas é utilizada para medir a produtividade individual dos membros da equipe, e os principais conceitos incluem a avaliação de desempenho e a rotatividade de tarefas.',
    ],
    correctIndex: 0,
  },
  {
    id: 12,
    text: 'Qual dos seguintes princípios é fundamental no Kanban?',
    alternatives: [
      'Sprints curtas e reuniões diárias.',
      'Refatoração contínua e programação em par.',
      'Limitar o trabalho em progresso e melhorar continuamente o fluxo de trabalho.',
      'Documentação extensiva e contratos rígidos com clientes.',
    ],
    correctIndex: 2,
  },
  {
    id: 13,
    text:
      'Em Lean Software Development, há um foco forte na otimização do todo, ao contrário da sub-otimização local (melhorar partes sem considerar o impacto no sistema completo). Considere a situação: uma equipe decide automatizar a geração de relatórios internos para economizar 15 minutos por dia, mas isso exige que outra equipe de infraestrutura disponibilize recursos específicos de servidor, impactando negativamente o tempo de resposta de outras aplicações críticas. Qual princípio do Lean Software Development está sendo violado nessa decisão?',
    alternatives: [
      'Amplificar aprendizado',
      'Construir qualidade',
      'Adiar decisões',
      'Otimizar o todo',
      'Eliminar desperdícios',
    ],
    correctIndex: 3,
  },
  {
    id: 14,
    text:
      'Um princípio muitas vezes mal compreendido no Lean Software Development é o de adiar decisões, ou seja, tomar decisões importantes no "último momento responsável", visando maximizar a flexibilidade e a capacidade de resposta às mudanças. Em qual dos cenários abaixo o princípio de adiar decisões está sendo corretamente aplicado?',
    alternatives: [
      'Definir toda a arquitetura do sistema nos primeiros dias do projeto para evitar retrabalho.',
      'Escolher a linguagem de programação e o framework antes de ter clareza dos requisitos e restrições técnicas.',
      'Prototipar rapidamente soluções para testar hipóteses antes de escolher a abordagem definitiva.',
      'Adiar indefinidamente decisões técnicas para evitar assumir compromissos.',
      'Criar um backlog fixo e totalmente congelado no início do projeto para manter previsibilidade.',
    ],
    correctIndex: 2,
  },
  {
    id: 15,
    text:
      'O Feature-Driven Development combina modelagem com desenvolvimento incremental baseado em funcionalidades. Sobre o papel da modelagem no FDD, qual alternativa representa corretamente a sua função no processo?',
    alternatives: [
      'A modelagem é eliminada no FDD, pois o foco exclusivo está na entrega rápida de funcionalidades.',
      'O modelo inicial é descartável e não influencia na identificação das features do projeto.',
      'O modelo é desenvolvido de forma abrangente e completa antes da implementação das features, e congelado após essa fase.',
      'O modelo é construído de forma colaborativa e iterativa, e serve como base contínua para identificar, organizar e priorizar as funcionalidades a serem implementadas.',
      'O modelo é utilizado apenas para fins documentais e não interfere diretamente na construção das funcionalidades.',
    ],
    correctIndex: 3,
  },
  {
    id: 16,
    text:
      'Um dos principais diferenciais do Feature-Driven Development em relação a outras abordagens ágeis é a sua ênfase em funcionalidades pequenas, mensuráveis e orientadas ao cliente. Qual das práticas abaixo não é compatível com os princípios do FDD?',
    alternatives: [
      'Dividir o sistema em funcionalidades curtas e entregáveis que façam sentido para o cliente.',
      'Utilizar um modelo de domínio como guia para a identificação das funcionalidades.',
      'Atribuir responsáveis por classes específicas que participam de múltiplas funcionalidades ao longo do projeto.',
      'Planejar toda a lista de funcionalidades antes do início do projeto e evitar mudanças durante sua execução.',
      'Medir o progresso do projeto com base nas funcionalidades planejadas, iniciadas e completadas.',
    ],
    correctIndex: 3,
  },
  {
    id: 17,
    text:
      'O Feature-Driven Development (FDD) define papéis específicos: 1. Chief Architect; 2. Chief Programmer; 3. Class Owner; 4. Domain Expert; 5. Project Manager.\n' +
      'Associe cada papel à sua responsabilidade, na ordem:\n' +
      '( ) Fornece conhecimento do domínio e valida os termos e fluxos usados na modelagem das funcionalidades.\n' +
      '( ) Responsável técnico por um conjunto de classes do sistema, implementando-as ou ajustando-as conforme necessário.\n' +
      '( ) Coordenação geral técnica do projeto, conduzindo sessões de modelagem e garantindo coerência arquitetural.\n' +
      '( ) Lidera o planejamento detalhado de funcionalidades, forma equipes temporárias por feature e supervisiona a entrega.\n' +
      '( ) Coordenação geral do projeto, prazos, status de progresso e comunicação com stakeholders.\n' +
      'A ordem correta (de cima para baixo) é:',
    alternatives: [
      '4 – 3 – 1 – 2 – 5',
      '2 – 3 – 4 – 1 – 5',
      '5 – 3 – 1 – 4 – 2',
      '4 – 2 – 1 – 3 – 5',
      '1 – 4 – 3 – 2 – 5',
    ],
    correctIndex: 0,
  },
  {
    id: 18,
    text:
      'O SAFe organiza o trabalho em diferentes níveis (Team, Program, Large Solution e Portfolio), cada um com papéis e responsabilidades específicos. Qual alternativa associa corretamente os papéis aos seus respectivos níveis no SAFe?',
    alternatives: [
      'Scrum Master (Team Level), Product Manager (Portfolio Level), RTE (Program Level)',
      'Product Owner (Team Level), Release Train Engineer (Program Level), Solution Train Engineer (Large Solution Level)',
      'System Architect (Team Level), Epic Owner (Team Level), Business Owner (Program Level)',
      'Product Owner (Program Level), Solution Architect (Team Level), RTE (Portfolio Level)',
      'Release Train Engineer (Team Level), Agile Coach (Program Level), Epic Owner (Team Level)',
    ],
    correctIndex: 1,
  },
  {
    id: 19,
    text:
      'O PI Planning (Program Increment Planning) é um dos eventos mais característicos do SAFe, realizado periodicamente para alinhar as equipes de um Agile Release Train (ART) em torno de objetivos comuns. Qual alternativa representa um dos principais objetivos estratégicos do PI Planning?',
    alternatives: [
      'Estimar a velocidade de cada equipe para fins de bonificação individual.',
      'Consolidar todos os requisitos técnicos do sistema em um backlog fixo.',
      'Criar planos de release detalhados e imutáveis para o trimestre seguinte.',
      'Alinhar equipes em torno de um objetivo comum e definir os Program Objectives, com base em colaboração com os stakeholders.',
      'Garantir que cada equipe execute o planejamento de forma isolada, focando em sua própria eficiência.',
    ],
    correctIndex: 3,
  },
  {
    id: 20,
    text:
      'O LeSS estende o Scrum para ambientes com múltiplas equipes trabalhando em um único produto. Sobre a estrutura de papéis no LeSS, assinale a alternativa correta:',
    alternatives: [
      'Cada equipe possui seu próprio Product Owner, que define prioridades específicas para o seu backlog.',
      'Existe apenas um Product Owner para todo o produto, e todas as equipes compartilham o mesmo Product Backlog.',
      'O LeSS adota um Product Owner por equipe, mas sincroniza os backlogs semanalmente.',
      'Cada equipe possui seu próprio Scrum Master, que também atua como facilitador entre as demais equipes.',
      'No LeSS, o papel de Scrum Master é substituído por um Coach de Agilidade com autoridade organizacional.',
    ],
    correctIndex: 1,
  },
  {
    id: 21,
    text:
      'Embora tanto o LeSS quanto o SAFe sejam frameworks voltados à agilidade em larga escala, eles partem de premissas distintas. Qual das opções melhor descreve uma filosofia central do LeSS?',
    alternatives: [
      'O LeSS enfatiza a governança corporativa com muitos níveis organizacionais e forte papel de liderança central.',
      'O LeSS introduz papéis e estruturas adicionais para garantir o controle técnico e financeiro em grandes organizações.',
      'O LeSS busca escalar o Scrum mantendo sua simplicidade, evitando complexidade organizacional e promovendo times altamente autogerenciáveis.',
      'O LeSS elimina o papel de Product Owner para permitir maior autonomia por equipe e múltiplos backlogs.',
      'O LeSS exige a formação de times temporários para cada incremento de produto, com rotatividade entre membros.',
    ],
    correctIndex: 2,
  },
];
