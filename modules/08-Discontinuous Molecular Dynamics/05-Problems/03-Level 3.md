

**Problem 1**

1. Buckyballs are 60-carbon molecules arranged roughly in the shape of a soccer ball, with $\sigma \approx 1nm$.  Xenon is a spherical molecule composed of a single atom with $\sigma \approx 0.4nm$ in diameter.  How should the parameter $\lambda$ change for these two molecules?  That is, should $\lambda$ for buckyballs be larger, smaller, or the same relative to $\lambda$ for Xenon?

**Problem 2**

1. The simulation data for the 3D HS fluid end at a packing fraction $(\eta )$ of 0.494, but hexagonal packing gives $\eta = 0.74048$.  What happens in between?

**Problem 3**

1. Compare the pressure obtained for the repulsion only simulation to that from the SW MD applet and from the piston-cylinder applet.  Referring to the figure on P13 of the text, explain how the box must change in a system with hard walls to obtain the same trajectory and pressure for a repulsive disk compared to an ideal gas.  Referring to the picture below, which region should be used to obtain the ideal gas pressure in the low density limit, the blue area or the area inside the green (and gray) bars?

![](./DMD_Lvl3_1.jpg)
<!--- file missing ![](./DMD_Lvl3_2.jpg) --->

**Problem 4**

Most of this discussion has focused on P, $\rho$, T relations, but we could also study rate processes.  In particular, we could investigate diffusion by adapting the approach of [Example 4](DMD/Example 4).

1. To track the motions of the particles, you would need to slow the simulations down.  How could you relate the velocities of the particles to the distance they travel on your screen?  
1. What other information is available through the applet that could help you address this issue?
1. How would you suggest that the applet be improved to facilitate this analysis?

**Problem 5**

Adsorption involves molecules sticking to surfaces.  For example, you may have seen activated charcoal used to filter impurities from water in a fish tank.  A simple approximation of adsorption is to represent the surface as a smooth plane.  Suppose you wanted to adsorb Xenon from its 3D fluid to a 2D surface monolayer at a packing fraction of 0.4 in each phase.  Assume the parameters for Xenon are $\varepsilon = 1000J/mol$, $\sigma = 0.4nm$, $\lambda = 2.0$.

1. a)How would the surface-to-Xenon energy contribute to the total energy of the 2D fluid? 
1. What value of surface-to-Xenon energy would give you the same molar energy in the monolayer that you have in the 3D fluid?  (Hint: 2D Xe-Xe energies also contribute to the total energy.)
