import React from 'react'
import './Sobre.css'
import github from '../../assets/github.png'
import linkedin from '../../assets/linkedin.png'

export default function Sobre() {
    return (
        <div className="sobre-body">
            <div className="sobre-container">

                <section className="sobre-secao problematica">
                    <h1>Sobre o Orienta.ai</h1>
                    <p>
                        Escolher um orientador é uma das decisões mais importantes 
                        na jornada de um estudante. Encontrar um professor cuja linha
                        de pesquisa realmente se alinhe ao tema de interesse do aluno geralmente exige
                        vasculhar dezenas de currículos Lattes, páginas de grupos de pesquisa e
                        publicações espalhadas, um processo manual e demorado.
                    </p>
                    <p>
                        O Orienta.ai nasceu para resolver esse problema: usando inteligência artificial
                        para interpretar o tema de pesquisa do estudante e cruzá-lo com os perfis reais
                        dos professores, indicando não apenas quem pode orientar, mas por que aquele
                        professor é uma boa escolha, com justificativas claras, baseadas na produção
                        acadêmica de cada um.
                    </p>
                    <p>
                        Todos os dados utilizados pela aplicação são provenientes da <strong><a className="link" href="https://www.lattes.cnpq.br/" target="_blank" rel="noopener noreferrer">Plataforma Lattes</a></strong>,
                        base pública de pesquisadores brasileiros. Para adicionar novos professores, o sistema faz a ingestão de PDFs de currículos Lattes para montar o perfil do pesquisador.
                    </p>
                    <p>
                        Essa instância de exemplo do Orienta.ai contempla todos os professores
                        da <strong><a className="link" href="https://eic.cefet-rj.br/portal/" target="_blank" rel="noopener noreferrer">Escola de Informática e Computação (EIC)</a></strong> do <strong><a className="link" href="https://www.cefet-rj.br/" target="_blank" rel="noopener noreferrer">CEFET/RJ</a></strong>, sendo facilmente extensível para outras instituições.
                    </p>
                </section>

                <section className="sobre-secao sobre-mim">
                    <h2>Sobre mim</h2>
                    <div className="sobre-mim-card">
                        <p>
                            Meu nome é Erick Borba, sou estudante de Bacharelado em Ciência da
                            Computação no CEFET/RJ e desenvolvedor back-end com experiência em
                            Java, Spring Boot, Python e Node.js. Desenvolvi o Orienta.ai unindo
                            essa base de backend com integração de APIs de IA e front-end em React.
                        </p>
                        <p>
                            Atualmente atuo como Analista de Sistemas estagiário no BNDES, na área
                            de desenvolvimento web, e como bolsista de Iniciação Tecnológica no
                            Inmetro, trabalhando com sistemas distribuídos e aprendizagem federada
                            aplicados à estimativa de demanda energética de frotas veiculares, além
                            de um projeto de detecção de intrusão em redes veiculares. Também já
                            atuei como monitor de Programação Orientada a Objetos no CEFET/RJ.
                        </p>
                        <p>
                            Para saber um pouco mais sobre mim:
                        </p>

                        <div className="sobre-links">
                            <a
                                href="https://www.linkedin.com/in/erick1618/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sobre-link"
                            >
                                <img src={linkedin} alt="LinkedIn" />
                                LinkedIn
                            </a>
                            <a
                                href="https://github.com/erick1-618/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sobre-link"
                            >
                                <img src={github} alt="GitHub" />
                                GitHub
                            </a>
                            
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}