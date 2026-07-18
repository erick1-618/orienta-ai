import React from 'react'
import './Sobre.css'
import github from '../../assets/github.png'
import linkedin from '../../assets/linkedin.png'

export default function Sobre() {
    return (
        <div className="sobre-body">
            <div className="sobre-container">

                <section className="sobre-secao problematica">
                    <h1>Sobre o Orienta.AI</h1>
                    <p>
                        Escolher um orientador é uma das decisões mais importantes — e mais difíceis —
                        na jornada de um estudante de pós-graduação. Encontrar um professor cuja linha
                        de pesquisa realmente se alinhe ao tema de interesse do aluno geralmente exige
                        vasculhar dezenas de currículos Lattes, páginas de grupos de pesquisa e
                        publicações espalhadas, um processo manual, demorado e sujeito a deixar de lado
                        orientadores em potencial só porque não são os mais conhecidos ou visíveis.
                    </p>
                    <p>
                        O Orienta.AI nasceu para resolver esse problema: usando inteligência artificial
                        para interpretar o tema de pesquisa do estudante e cruzá-lo com os perfis reais
                        dos professores, indicando não apenas quem pode orientar, mas <strong>por que</strong> aquele
                        professor é uma boa escolha — com justificativas claras, baseadas na produção
                        acadêmica de cada um.
                    </p>
                </section>

                <section className="sobre-secao sobre-mim">
                    <h2>Sobre mim</h2>
                    <div className="sobre-mim-card">
                        <p>
                            Meu nome é Erick Borba, sou estudante de Bacharelado em Ciência da
                            Computação no CEFET/RJ e desenvolvedor back-end com experiência em
                            Java, Spring Boot, Python e Node.js. Desenvolvi o Orienta.AI unindo
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
                            Para saber um pouco mais sobre mim, acesse os meus links abaixo:
                        </p>

                        <div className="sobre-links">
                            <a
                                href="https://github.com/erick1-618/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sobre-link"
                            >
                                <img src={github} alt="GitHub" />
                                GitHub
                            </a>
                            
                            <a
                                href="https://www.linkedin.com/in/erick1618/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sobre-link"
                            >
                                <img src={linkedin} alt="LinkedIn" />
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}