

The simulation model that we will use in this module is as follows.

The adsorbate (surface) consists of a flat plane at the bottom of the simulation
cell.  The simulation cell measures $12\sigma$ tall and the
surface is $8\times 8\sigma^2$ in area.

Up to two different gases (A and B) can be present.  These gases have the same
properties, but can interact differently with the adsorbate.

The key quantities that need to be specified are:

1. Temperature of the simulation. This is actually RT, given in the same units as epsilon.

2. Pressure of gas A (and of gas B, if present), given by a logarithmic slider control.

3. "epsilon" ($\epsilon$) which controls the interaction energy between a gas molecule 
and the adsorbate.  If there are two gases present, they can interact with the adsorbate
differently - $\epsilon_A \ne \epsilon_B$.

The adsorption module measures the excess amount of each adsorbed gas, as well as the total
potential energy of all the particles present (including their interaction with the surface.)
It also provides the density profile of the adsorbed gas - the amount of gas present at various
distances perpendicular to the adsorbate.