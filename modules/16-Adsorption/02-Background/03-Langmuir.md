

The most important model of adsorption is the Langmuir isotherm, introduced by I. Langmuir in 1916.  This model assumes that:

1. Molecules adsorb on the surface (but not on each other)

2. Adsorbed molecules do not interact with each other

3. The surface is homogeneous:  all locations adsorb molecules with the same enthalpy.

Langmuir's original derivation is based on setting the rates of adsorption and desorption
equal to each other and solving for the steady-state coverage at the surface, but we can equally well
apply simple chemical equilibrium theory to the problem.  First we write the 
adsorption process as a chemical reaction:

$$
A(g) + S \rightleftharpoons A(ads)
$$

where $S$ is a surface site, which is then blocked
from adsorbing another molecule.  The corresponding chemical equilibrium expression is then: 

$$
\frac{a(A(ads))}{a(A(g))\times a(S)} = \frac{[A(ads)]}{P_A\times[S]} = K
$$

where $a(X)$ is the activity of $X$ and $K$ is the equilibrium constant,
and we assume that both the gas and adsorbed film behave ideally. (This is the "no interaction" condition.) 
We use the fact that the total concentration of surface sites (the *monolayer capacity*) 
$[S]_0$ is a constant, and write:

$$
[S] + [A(ads)] = [S]_0
$$

Finally, defining the surface coverage as $\theta = [A(ads)]/[S]_0$, the fraction of surface
sites on which are adsorbed molecules of A, we arrive at:

$$
K = \frac{[A(ads)]}{P_A\times ([S]_0 - [A(ads)] )} = \frac{\theta}{P_A\times(1-\theta)}
$$

which we can solve for $\theta$:

$$
\theta = \frac{KP_A}{1+KP_A}
$$

which gives the surface coverage as a function of the pressure of gas above the surface, and the equilibrium
constant.  Several Langmuir isotherms, differing in $K$, are shown in the following plot:

![](./langmuir plot.png)

At high $K$, the surface is strongly adsorbent, and the adsorbing gas forms a nearly complete monolayer
($\theta = 1$) at low pressures.  At low  $K$, much higher gas pressures are required for the
same coverage.  In all cases, at sufficiently low coverage, the isotherm is linear, that is:

$$
\theta \simeq KP_A
$$

This is called the *Henry's Law region*, because it is analogous to Henry's Law for gases dissolved in solution.

Finally, the total adsorption is just given by $\theta \times [S]_0$.  The Langmuir isotherm is accurate
under conditions of low coverage and high adsorption enthalpy (such that interactions between neighboring 
adsorbed molecules can safely be neglected.)  For this reason it is widely used in studies of chemisorption and
analysis of heterogeneous catalysis kinetics. Nonetheless, it is also useful for physisorption at high temperatures
and low pressures.