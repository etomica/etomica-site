

The catalysis module uses an atomic model (O and C atoms, as well as surface atoms, are each represented explicitly).  All atoms interacts via a square-well intermolecular potential.  The functional form of the square well potential is shown below:

$$
\tag{Equation 8} u(r)= \begin{cases} \begin{aligned} \infty \text{ if r} \leq \sigma \\ -\epsilon \text{ if r} < \lambda\sigma \\ 0 \text{ if r} \geq \lambda\sigma \end{aligned} \end{cases} 
$$


where $\sigma$ is the collision diameter, $\epsilon$ is the well depth (minimum potential energy), and $\lambda$ is the reduced well width.

Graphically, the SW potential can be representated as:


![](./Potential.gif)


All atoms interacting with the surface must have 3 surface sites (atoms) to react/adsorb, or to become stable on the catalyst surface.  Diatomic species (CO and O<sub>2</sub>) require 2 sites to adsorb.  The triatomic product CO<sub>2</sub>, once formed, does not dissociate (thermodynamically stable).

The atoms are propagated through time and space using the discontinuous molecular dynamic ([DMD](</modules/Discontinuous Molecular Dynamics>)) method, in conjunction with the square well potential mentioned above.