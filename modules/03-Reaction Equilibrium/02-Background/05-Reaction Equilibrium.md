

For the elementary reaction

$$
X + Y \leftrightarrows XY
$$

where *X* and *Y* may be *R* or *B*, chemical equilibrium requires

$$
\mu_{XY} - \mu_X - \mu_Y = 0
$$

If we separate the chemical potential into various contributions, as described in the [Standard Properties](ReactionEquilibrium/Background/Reaction Equilibrium Standard Properties) page, this is



$$
\mu^0_{XY}(T) + kT \ln(\rho x_{XY}\phi_{XY}) - [\mu^0_X(T) + kT \ln(\rho x_{X}\phi_{X}) + \mu^0_Y(T) + kT \ln(\rho x_{Y}\phi_{Y})] = 0
$$



We can collect terms as follows

$\left (\frac {1}{\rho}\right ) \left (\frac{x_{XY}}{x_Xx_Y}\right ) \left (\frac{\phi_{XY}}{\phi_X\phi_Y}\right ) = \exp[-(\mu^0_{XY} - \mu^0_X - \mu^0_Y) / kT]$



We define the equilibrium constant <i>K</i>(<i>T</i>) by the right-hand side of this equation; on this Standard properties page the standard-state chemical potentials are given in terms of the potential parameters, so <i>K</i>(<i>T</i>) is known.&nbsp; Then

$\left (\frac {1}{\rho}\right ) \left (\frac{x_{XY}}{x_Xx_Y}\right ) \left (\frac{\phi_{XY}}{\phi_X\phi_Y}\right ) = K_{XY}(T)$



The fugacity coefficients $\phi_i$ are not known in general.  For sufficiently low density they approach unity (1.0).  It may also happen that the ratio of the $\phi_i$ is approximately 1.0 even when they are not individually.  For our calculations we will make this approximation.

We can write an equilibrium equation for each of the elementary reactions listed on the [System](ReactionEquilibrium/Background/Reaction Equilibrium System) page.  This gives us three equations to solve for the six unknowns in this system:  $\rho, x_R, x_B, x_{RR}, x_{RB}, x_{BB}$.  Two of the other three equations express the fact that the total number of <i>R</i> atoms and <i>B</i> atoms in the system cannot change



$\rho\left (x_R + 2x_{RR} + x_{RB}\right ) = \left [\rho(x_R + 2x_{RR} + x_{RB})\right ]_{initial}$

$\rho\left (x_B + 2x_{BB} + x_{RB}\right ) = \left [\rho(x_B + 2x_{BB} + x_{RB})\right ]_{initial}$



and the other is simply the normalization of the mole fractions



$x_R + x_B + x_{RR} + x_{RB} + x_{BB} = 1$