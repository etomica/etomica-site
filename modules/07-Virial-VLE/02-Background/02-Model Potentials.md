

The interaction potential energy surface (PES) between two molecules depends on their distance and relative
orientation. These days the PES can be calculated *ab–initio* by using high–quality electronic structure
methods. However, the PES may have a complicated form. Simple models have been devised that capture the
general features of intermolecular interaction. With suitable adjustments and refinements, these potentials
are also capable of yielding good agreement with experiment when used in molecular simulations.
An example for a simple interaction model potential *U* between two neutral molecules is the *Lennard–Jones* (LJ, or 6/12) potential:


$U(R) = \varepsilon \left [ \left(\frac{R_0}{R} \right )^{12} - 2 \left ( \frac{R_0}{R} \right )^6 \right ]$    ..... (Equation 3)



Here, $\varepsilon$ quantifies the strength of the interaction, R is the distance between the molecules, and $R_0$ is the location of the minimum, as shown in the plot below:


![](<./VLE MinLoc.jpg>)


Another way of writing this potential is :


$U(R) = 4\varepsilon \left [ \left (\frac{R}{\sigma} \right )^{-12} - \left (\frac{R}{\sigma} \right )^{-6} \right ]$    ..... (Equation 4)



where $\sigma$ is the separation where the potential is zero.
In the plot above, the potential *U* exhibits an attraction between two molecules at larger distances and a
strong repulsion at short distances, which is typical for neutral molecules.
In the VLE simulation module we attempt to obtain reasonable agreement with experimental data. In this
case, for a molecule such as CO<sub>2</sub> the simple LJ potential is not accurate enough. The reason is that the atoms
in CO<sub>2</sub> carry partial charges, i.e. the charge distribution in the molecule is non–spherical. As a consequence,
the interaction potential depends not only on the distance *R* but also on the relative orientation of the two
molecules and has a somewhat different distance dependence. For molecules without permanent dipole
moments (example: CO<sub>2</sub>) the lowest–order electrostatic term relevant here is the quadrupole–quadrupole
interaction. Given a charge density $\rho$ of the molecule, the elements of a traceless electric quadrupole
moment tensor can be defined as [[1]](VirialVLE/References#ref1)

$Q_{\alpha\beta} = \frac{1}{2} \int dr \dot \rho(r)(3r_{\alpha}r_{\beta} - r^2 \delta_{\alpha\beta})$    ..... (Equation 5)



where $\alpha, \beta \in x, y, z$.  "Traceless" means that $Q_{xx} + Q_{yy} + Q_{zz} = 0$. For a molecule, we have two contributions: one from the electron density (counts negative), and one from the nuclei A with charges $Z_A$, positions $r_A$ and point–charge density $\rho(r) = \textstyle \sum_{A} Z_A \delta(r_A)$. The quadrupole generates an electric potential $V_Q$ at a position **R** (with distance R) of :


$V_Q = \frac{1}{4\pi\epsilon_0}\sum_{\alpha\beta} \frac{R_{\alpha}R_{\beta}Q_{\alpha\beta}}{R^5}$    ..... (Equation 6)



along with a non–uniform electric field $E = - \nabla_R V$. The field is seen to decay with the 4th inverse power
of *R* at large distances *R*. Another quadrupolar molecule can interact with the *gradient* components $\nabla_{\alpha} E_{\beta}$
of this electric field [[2]](VirialVLE/References#ref2); the interaction energy U is proportional to $R^{-5}$ at large distances and therefore
provides an important contribution to the PES of neutral unpolar molecules such as CO<sub>2</sub>. Note that without
a quadrupole–quadrupole term we would be missing some longer–range interactions in the PES; the $R^{-6}$
term of the LJ potential does not reach as far out.